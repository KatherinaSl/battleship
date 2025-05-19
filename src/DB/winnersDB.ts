import { Winner } from '../common/model';

class WinnersDB {
  private winners: Winner[];
  constructor() {
    this.winners = [];
  }

  addWin(name: string) {
    const winner = this.winners.find((winner) => winner.name === name);
    if (winner) {
      winner.wins += 1;
    } else {
      this.winners.push({ name, wins: 1 });
    }
  }

  getWins(): Winner[] {
    return this.winners;
  }
}

export const winnersDB = new WinnersDB();
