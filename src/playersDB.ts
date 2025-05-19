import { Player } from './model';
import WebSocket from 'ws';

class PlayersDb {
  private players: Map<string, Player>;
  private connections: Map<string, WebSocket>;
  constructor() {
    this.players = new Map();
    this.connections = new Map();
  }

  login(name: string, password: string, socket: WebSocket): Player | null {
    if (this.players.has(name)) {
      const player = this.players.get(name);
      return player?.password === password ? player : null;
    }
    const player = {
      index: crypto.randomUUID(),
      name,
    };
    this.players.set(name, { ...player, password });

    //todo remove check after no errors
    if (this.connections.has(name)) {
      throw new Error(`${name} has active connection already`);
    }
    this.connections.set(name, socket);

    return player;
  }

  getSocket(player: Player): WebSocket | null {
    const name = player.name;
    return this.connections.get(name) ?? null;
  }

  getSocketById(id: string): WebSocket | null {
    const player = [...this.players.values()].find(
      (player) => player.index === id
    );
    if (!player) {
      return null;
    }
    return this.connections.get(player.name) ?? null;
  }

  logout(name: string) {
    console.log(`logout ${name}`);
    //todo refactor logout
    // const connection = this.connections.get(name);
    // if (connection && connection.readyState < CLOSING) {
    //   connection.close();
    // }
    // this.connections.delete(name);
  }
}

export const playersDB = new PlayersDb();
