import { Ship, ShipCell } from './model';

enum CellType {
  EMPTY,
  SHIP,
  MISS,
  SHOT,
}

const aroundCells = [
  [1, 1],
  [1, 0],
  [1, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
  [0, 1],
  [0, -1],
];

export class GameBoard {
  private gameBoard: Array<Array<CellType>>;
  private shotShips: Array<Array<ShipCell>>;

  constructor() {
    this.gameBoard = new Array(10);
    this.shotShips = [];

    for (let i = 0; i < this.gameBoard.length; i++) {
      this.gameBoard[i] = new Array(10);
      this.gameBoard[i].fill(CellType.EMPTY);
    }
  }

  addShips(ships: Ship[]) {
    ships.forEach((ship) => {
      const shipCells: ShipCell[] = [];
      for (let i = 0; i < ship.length; i++) {
        if (ship.direction) {
          this.setCell(ship.position.x, ship.position.y + i, CellType.SHIP);
          shipCells.push({
            x: ship.position.x,
            y: ship.position.y + i,
          });
        } else {
          this.setCell(ship.position.x + i, ship.position.y, CellType.SHIP);
          shipCells.push({
            x: ship.position.x + i,
            y: ship.position.y,
          });
        }
      }
      this.shotShips.push(shipCells);
    });
  }

  private getCell(x: number, y: number): CellType | null {
    if (0 <= x && x < 10 && 0 <= y && y < 10) {
      return this.gameBoard[x][y];
    }
    return null;
  }

  private setCell(x: number, y: number, cell: CellType) {
    this.gameBoard[x][y] = cell;
  }

  attack(x: number, y: number): ShipCell[] {
    const cell = this.getCell(x, y);
    if (cell === CellType.SHIP) {
      for (let i = 0; i < this.shotShips.length; i++) {
        const shipCell = this.shotShips[i].find(
          (cell) => cell.x === x && cell.y === y
        );
        if (shipCell) {
          this.setCell(x, y, CellType.SHOT);
          shipCell.status = 'shot';
        }
        if (this.shotShips[i].every((cell) => cell.status === 'shot')) {
          this.shotShips[i] = this.shotShips[i].map((cell) => {
            cell.status = 'killed';
            return cell;
          });
          const missedCells = this.setMissCells(this.shotShips[i]);
          return [...this.shotShips[i], ...missedCells];
        } else if (shipCell) {
          return [shipCell];
        }
      }
      return [];
    } else if (cell === CellType.EMPTY) {
      this.setCell(x, y, CellType.MISS);
      return [{ x, y, status: 'miss' }];
    } else {
      return [];
    }
  }

  randomAttack(): ShipCell[] {
    for (let i = 0; i < this.gameBoard.length; i++) {
      for (let j = 0; j < this.gameBoard[i].length; j++) {
        const cell = this.getCell(i, j);
        if (cell === CellType.EMPTY || cell === CellType.SHIP) {
          return this.attack(i, j);
        }
      }
    }
    return [{ status: 'miss', x: 0, y: 0 }];
  }

  setMissCells(ship: ShipCell[]): ShipCell[] {
    const missCells: Set<ShipCell> = new Set();
    ship.forEach((cell) => {
      this.getEmptyCellsAround(cell.x, cell.y).forEach((cell) => {
        missCells.add(cell);
        this.setCell(cell.x, cell.y, CellType.MISS);
      });
    });
    return Array.from(missCells);
  }

  getEmptyCellsAround(x: number, y: number): ShipCell[] {
    const ship: ShipCell[] = [];
    aroundCells.forEach((direction) => {
      const cellType = this.getCell(x + direction[0], y + direction[1]);
      if (cellType === CellType.EMPTY)
        ship.push({ x: x + direction[0], y: y + direction[1], status: 'miss' });
    });
    return ship;
  }
}
