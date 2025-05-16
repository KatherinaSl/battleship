import { AttackStatusType, RandomAttackStatus, Ship } from './model';

enum CellType {
  EMPTY,
  SHIP,
  MISS,
  SHOT,
}

export class GameBoard {
  private gameBoard: Array<Array<CellType>>;

  constructor() {
    this.gameBoard = new Array(10);

    for (let i = 0; i < this.gameBoard.length; i++) {
      this.gameBoard[i] = new Array(10);
      this.gameBoard[i].fill(CellType.EMPTY);
    }
  }

  addShips(ships: Ship[]) {
    ships.forEach((ship) => {
      for (let i = 0; i < ship.length; i++) {
        if (ship.direction) {
          this.setCell(ship.position.x, ship.position.y + i, CellType.SHIP);
        } else {
          this.setCell(ship.position.x + i, ship.position.y, CellType.SHIP);
        }
      }
    });
  }

  private getCell(x: number, y: number): CellType {
    return this.gameBoard[x][y];
  }

  private setCell(x: number, y: number, cell: CellType) {
    this.gameBoard[x][y] = cell;
  }

  //todo killed
  attack(x: number, y: number): AttackStatusType {
    const cell = this.getCell(x, y);
    if (cell === CellType.SHIP) {
      this.setCell(x, y, CellType.SHOT);
      return 'shot';
    } else {
      this.setCell(x, y, CellType.MISS);
      return 'miss';
    }
  }

  randomAttack(): RandomAttackStatus {
    for (let i = 0; i < this.gameBoard.length; i++) {
      for (let j = 0; j < this.gameBoard[i].length; j++) {
        const cell = this.getCell(i, j);
        if (cell === CellType.EMPTY || cell === CellType.SHIP) {
          return { status: this.attack(i, j), position: { x: i, y: j } };
        }
      }
    }
    return { status: 'miss', position: { x: 0, y: 0 } };
  }
}
