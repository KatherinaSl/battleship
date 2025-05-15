import { Game, Room, Ship } from './model';

class GamesDB {
  private games: Map<string, Game>;
  constructor() {
    this.games = new Map<string, Game>();
  }

  create(room: Room): Game {
    const [player1, player2] = room.roomUsers;
    const game = {
      id: crypto.randomUUID(),
      gameSet: [
        {
          playerId: player1.index,
          ships: [],
        },
        {
          playerId: player2.index,
          ships: [],
        },
      ],
    };
    this.games.set(game.id, game);
    return game;
  }

  addShips(gameId: string, playerId: string, ships: Ship[]) {
    const game = this.games.get(gameId);
    const gameSet = game?.gameSet.find((set) => set.playerId === playerId);
    gameSet?.ships.push(...ships);
    return game;
  }

  getAnotherPlayerShips(gameId: string, playerId: string): Ship[] | [] {
    const game = this.games.get(gameId);
    const gameSet = game?.gameSet.find((set) => set.playerId !== playerId);
    return gameSet?.ships ?? [];
  }

  getAnotherPlayerId(gameId: string, playerId: string): string | null {
    const game = this.games.get(gameId);
    const gameSet = game?.gameSet.find((set) => set.playerId !== playerId);
    return gameSet?.playerId ?? null;
  }
}

export const gameDB = new GamesDB();
