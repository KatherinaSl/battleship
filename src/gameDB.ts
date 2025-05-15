import { Game } from './model';

export class GamesDB {
  private games: Map<string, Game>;
  constructor() {
    this.games = new Map<string, Game>();
  }

  getGameId() {
    return crypto.randomUUID();
  }
}

export const gameDB = new GamesDB();
