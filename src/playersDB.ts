import { Player } from './model';
import WebSocket from 'ws';

interface PlayerWithConnection {
  player: Player;
  socket: WebSocket;
}

class PlayersDb {
  private players: Map<string, PlayerWithConnection>;
  constructor() {
    this.players = new Map<string, PlayerWithConnection>();
  }

  login(name: string, password: string, socket: WebSocket): Player | null {
    if (this.players.has(name)) {
      const playerWithConnection = this.players.get(name);
      return playerWithConnection?.player.password === password
        ? playerWithConnection.player
        : null;
    }
    const player = {
      index: crypto.randomUUID(),
      name,
    };
    this.players.set(name, {
      player: { ...player, password },
      socket,
    });
    return player;
  }

  getSocket(player: Player): WebSocket | null {
    const name = player.name;
    return this.players.get(name)?.socket ?? null;
  }
}

export const playersDB = new PlayersDb();
