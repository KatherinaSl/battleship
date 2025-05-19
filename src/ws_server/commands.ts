import { gameDB } from '../gameDB';
import {
  AddShipsData,
  AttackData,
  Player,
  Room,
  Ship,
  ShipCell,
} from '../model';
import { playersDB } from '../playersDB';
import { roomsDB } from '../roomsDB';
import WebSocket from 'ws';
import { winnersDB } from '../winnersDB';
import { wss } from '.';

export function updateRoomComand(wss: WebSocket.Server) {
  const updateRoomMsg = {
    type: 'update_room',
    data: JSON.stringify(roomsDB.getOnePlayerRooms()),
    id: 0,
  };
  wss.clients.forEach((ws) => ws.send(JSON.stringify(updateRoomMsg)));
}

export function regCommand(currentPlayer: Player, ws: WebSocket) {
  const answerData = {
    type: 'reg',
    data: JSON.stringify(currentPlayer),
    id: 0,
  };

  ws.send(JSON.stringify(answerData));
}

export function errorCommand(type: string, errorText: string, ws: WebSocket) {
  const answerError = {
    type,
    data: JSON.stringify({
      error: true,
      errorText,
    }),
    id: 0,
  };
  ws.send(JSON.stringify(answerError));
}

export function createGameCommand(currentPlayer: Player, indexRoom: string) {
  roomsDB.addToRoom(currentPlayer, indexRoom);
  const room = roomsDB.getRoom(indexRoom) as Room;

  const game = gameDB.create(room);

  room?.roomUsers.forEach((player) => {
    playersDB.getSocket(player)?.send(
      JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
          idGame: game.id,
          idPlayer: player.index,
        }),
        id: 0,
      })
    );
  });
}

export function addShipsCommand(shipsMsg: AddShipsData) {
  const { gameId, ships, indexPlayer } = shipsMsg;

  const game = gameDB.addShips(gameId, indexPlayer, ships);

  const isGameReady = game?.gameSet
    .map((set) => set.ships.length)
    .every((length) => length > 0);

  if (isGameReady) {
    const anotherShips = gameDB.getAnotherPlayerShips(gameId, indexPlayer);
    const anotherId = gameDB.getAnotherPlayerId(gameId, indexPlayer);

    startGameCommand(indexPlayer, ships);
    startGameCommand(anotherId!, anotherShips);

    //todo save whose turn in to the game
    turnCommand(indexPlayer, gameId);
  }
}

function startGameCommand(playerId: string, ships: Ship[]) {
  const msg = {
    type: 'start_game',
    data: JSON.stringify({
      ships,
      currentPlayerIndex: playerId,
    }),
    id: 0,
  };

  playersDB.getSocketById(playerId)?.send(JSON.stringify(msg));
}

export function attackCommand(attackMsg: AttackData) {
  const { gameId, x, y, indexPlayer } = attackMsg;

  const game = gameDB.get(gameId);
  const emenyGameBoard = game?.gameSet.find(
    (set) => set.playerId !== indexPlayer
  )?.gameBoard;

  const enemyAttack = emenyGameBoard!.attack(x, y);
  processAttacks(gameId, indexPlayer, enemyAttack);
}

export function randomAttackCommand(attackMsg: AttackData) {
  const { gameId, indexPlayer } = attackMsg;

  const game = gameDB.get(gameId);
  const emenyGameBoard = game?.gameSet.find(
    (set) => set.playerId !== indexPlayer
  )?.gameBoard;

  const enemyAttack = emenyGameBoard!.randomAttack();
  processAttacks(gameId, indexPlayer, enemyAttack);
}

function turnCommand(playerId: string, gameId: string) {
  const msg = {
    type: 'turn',
    data: JSON.stringify({
      currentPlayer: playerId,
    }),
  };
  const anotherPlayerId = gameDB.getAnotherPlayerId(gameId, playerId);

  playersDB.getSocketById(playerId)?.send(JSON.stringify(msg));
  playersDB.getSocketById(anotherPlayerId!)?.send(JSON.stringify(msg));
}

function processAttacks(
  gameId: string,
  indexPlayer: string,
  enemyAttack: ShipCell[]
) {
  const anotherId = gameDB.getAnotherPlayerId(gameId, indexPlayer);
  const game = gameDB.get(gameId);
  const enemyGameBoard = game?.gameSet.find(
    (gameSet) => gameSet.playerId === anotherId
  )?.gameBoard;

  enemyAttack?.forEach((cell) => {
    const attackData = JSON.stringify({
      type: 'attack',
      data: JSON.stringify({
        position: { x: cell.x, y: cell.y },
        currentPlayer: indexPlayer,
        status: cell.status,
      }),
      id: 0,
    });
    playersDB.getSocketById(indexPlayer)?.send(attackData);
    playersDB.getSocketById(anotherId!)?.send(attackData);
  });

  if (enemyAttack?.length) {
    if (!enemyAttack || enemyAttack.every((cell) => cell.status === 'miss')) {
      turnCommand(anotherId!, gameId);
    } else {
      turnCommand(indexPlayer, gameId);
    }
  }

  if (enemyGameBoard?.isFinished()) {
    winnersDB.addWin(playersDB.getPlayer(indexPlayer)!.name);
    const finishedData = JSON.stringify({
      type: 'finish',
      data: JSON.stringify({
        winPlayer: indexPlayer,
      }),
      id: 0,
    });

    playersDB.getSocketById(indexPlayer)?.send(finishedData);
    playersDB.getSocketById(anotherId!)?.send(finishedData);

    updateWinnersCommand(wss);
  }
}

export function updateWinnersCommand(wss: WebSocket.Server) {
  const undateWinnersData = {
    type: 'update_winners',
    data: JSON.stringify(winnersDB.getWins()),
    id: 0,
  };

  wss.clients.forEach((ws) => ws.send(JSON.stringify(undateWinnersData)));
}
