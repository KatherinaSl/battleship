import { Player } from './model';

class PlayersDb {
  private players: Map<string, Player>;
  constructor() {
    this.players = new Map<string, Player>();
  }

  login(name: string, password: string): Player | null {
    if (this.players.has(name)) {
      const player = this.players.get(name);
      return player?.password === password ? player : null;
    }
    const player = {
      index: crypto.randomUUID(),
      name,
    };
    this.players.set(name, { ...player, password });
    return player;
  }
}

export const playersDB = new PlayersDb();
