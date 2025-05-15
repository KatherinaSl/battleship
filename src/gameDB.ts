import { Game, Room } from './model';

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
}

export const gameDB = new GamesDB();
