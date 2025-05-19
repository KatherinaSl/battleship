import { Player } from '../common/model';
import WebSocket from 'ws';

class PlayersDb {
  private players: Map<string, Player>;
  private connections: Map<string, WebSocket>;
  constructor() {
    this.players = new Map();
    this.players.set('bot', { name: 'bot', index: 'bot' });
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

    if (this.connections.has(name)) {
      throw new Error(`${name} has active connection already`);
    }
    this.connections.set(name, socket);

    return player;
  }

  getPlayer(id: string): Player | null {
    return (
      [...this.players.values()].find((player) => player.index === id) ?? null
    );
  }

  getSocket(player: Player): WebSocket | null {
    const name = player.name;
    return this.connections.get(name) ?? null;
  }

  getSocketById(id: string | null): WebSocket | null {
    const player = [...this.players.values()].find(
      (player) => player.index === id
    );
    if (!player) {
      return null;
    }
    return this.connections.get(player.name) ?? null;
  }
}

export const playersDB = new PlayersDb();
