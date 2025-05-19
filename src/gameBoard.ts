import { Ship, ShipCell } from './model';

enum CellType {
  EMPTY,
  SHIP,
  MISS,
  SHOT,
}

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

  private getCell(x: number, y: number): CellType {
    return this.gameBoard[x][y];
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
          return this.shotShips[i];
        } else if (shipCell) {
          return [shipCell];
        }
      }
      return [{ x, y, status: 'miss' }];
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
}
