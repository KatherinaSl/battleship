import { gameDB } from '../DB/gameDB';
import {
  AddShipsData,
  AttackData,
  Game,
  MsgType,
  Player,
  Room,
  Ship,
  ShipCell,
} from '../common/model';
import { playersDB } from '../DB/playersDB';
import { roomsDB } from '../DB/roomsDB';
import WebSocket from 'ws';
import { winnersDB } from '../DB/winnersDB';
import { wss } from '.';

function send(type: MsgType, data: string, ws: WebSocket | null) {
  const message = JSON.stringify({
    type,
    data,
    id: 0,
  });

  if (ws) {
    console.log(`Send command: ${message}`);
    ws.send(message);
  }
}

export function updateRoomCommand(wss: WebSocket.Server) {
  const data = JSON.stringify(roomsDB.getOnePlayerRooms());
  wss.clients.forEach((ws) => send('update_room', data, ws));
}

export function regCommand(currentPlayer: Player, ws: WebSocket) {
  const data = JSON.stringify(currentPlayer);
  send('reg', data, ws);
}

export function errorCommand(type: MsgType, errorText: string, ws: WebSocket) {
  const data = JSON.stringify({
    error: true,
    errorText,
  });
  send(type, data, ws);
}

export function createGameCommand(
  currentPlayer: Player,
  indexRoom: string
): Game {
  roomsDB.addToRoom(currentPlayer, indexRoom);
  const room = roomsDB.getRoom(indexRoom) as Room;

  const game = gameDB.create(room);

  room?.roomUsers.forEach((player) => {
    const data = JSON.stringify({
      idGame: game.id,
      idPlayer: player.index,
    });
    send('create_game', data, playersDB.getSocket(player));
  });

  return game;
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

    turnCommand(indexPlayer, gameId);
  }
}

function startGameCommand(playerId: string, ships: Ship[]) {
  const data = JSON.stringify({
    ships,
    currentPlayerIndex: playerId,
  });
  send('start_game', data, playersDB.getSocketById(playerId));
}

export function attackCommand(attackMsg: AttackData) {
  const { gameId, x, y, indexPlayer } = attackMsg;

  const game = gameDB.get(gameId);
  const emenyGameBoard = game?.gameSet.find(
    (set) => set.playerId !== indexPlayer
  )?.gameBoard;

  if (game?.playerTurnId === indexPlayer) {
    const enemyAttack = emenyGameBoard!.attack(x, y);
    processAttacks(gameId, indexPlayer, enemyAttack);
  }
}

export function randomAttackCommand(attackMsg: AttackData) {
  const { gameId, indexPlayer } = attackMsg;

  const game = gameDB.get(gameId);
  const emenyGameBoard = game?.gameSet.find(
    (set) => set.playerId !== indexPlayer
  )?.gameBoard;

  if (game?.playerTurnId === indexPlayer) {
    const enemyAttack = emenyGameBoard!.randomAttack();
    processAttacks(gameId, indexPlayer, enemyAttack);
  } 
}

function turnCommand(playerId: string, gameId: string) {
  const anotherPlayerId = gameDB.getAnotherPlayerId(gameId, playerId);

  const game = gameDB.get(gameId);
  if (game) {
    game.playerTurnId = playerId;
  }
  if (playerId === 'bot') {
    randomAttackCommand({ gameId, indexPlayer: playerId, x: 0, y: 0 });
    return;
  }

  const data = JSON.stringify({
    currentPlayer: playerId,
  });

  send('turn', data, playersDB.getSocketById(playerId));
  send('turn', data, playersDB.getSocketById(anotherPlayerId));
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
    const data = JSON.stringify({
      position: { x: cell.x, y: cell.y },
      currentPlayer: indexPlayer,
      status: cell.status,
    });
    send('attack', data, playersDB.getSocketById(indexPlayer));
    send('attack', data, playersDB.getSocketById(anotherId));
  });

  if (enemyGameBoard?.isFinished()) {
    winnersDB.addWin(playersDB.getPlayer(indexPlayer)!.name);
    const data = JSON.stringify({
      winPlayer: indexPlayer,
    });
    send('finish', data, playersDB.getSocketById(indexPlayer));
    send('finish', data, playersDB.getSocketById(anotherId));

    updateWinnersCommand(wss);
  } else if (enemyAttack?.length) {
    if (!enemyAttack || enemyAttack.every((cell) => cell.status === 'miss')) {
      turnCommand(anotherId!, gameId);
    } else {
      turnCommand(indexPlayer, gameId);
    }
  }
}

export function updateWinnersCommand(wss: WebSocket.Server) {
  const data = JSON.stringify(winnersDB.getWins());
  wss.clients.forEach((ws) => send('update_winners', data, ws));
}
