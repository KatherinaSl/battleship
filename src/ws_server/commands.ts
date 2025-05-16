import { gameDB } from '../gameDB';
import { Player } from '../model';
import { playersDB } from '../playersDB';
import { roomsDB } from '../roomsDB';
import WebSocket from 'ws';

export function updateRoomComand(wss: WebSocket.Server) {
  const updateRoomMsg = {
    type: 'update_room',
    data: JSON.stringify(roomsDB.getOnePlayerRooms()),
  };
  wss.clients.forEach((ws) => ws.send(JSON.stringify(updateRoomMsg)));
}

export function regCommand(currentPlayer: Player, ws: WebSocket) {
  const answerData = {
    type: 'reg',
    data: JSON.stringify(currentPlayer),
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
  };
  ws.send(JSON.stringify(answerError));
}

export function createGameCommand(currentPlayer: Player, indexRoom: string) {
  roomsDB.addToRoom(currentPlayer, indexRoom);
  const room = roomsDB.getRoom(indexRoom);

  const game = gameDB.create(room!);

  room?.roomUsers.forEach((player) =>
    playersDB.getSocket(player)?.send(
      JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
          idGame: game.id,
          idPlayer: player.index,
        }),
      })
    )
  );
}

export function turnCommand(playerId: string, gameId: string) {
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
