import { WebSocketServer } from 'ws';
import { AttackData, Message, Player, RegData } from '../model';
import { playersDB } from '../playersDB';
import { roomsDB } from '../roomsDB';
import {
  createGameCommand,
  errorCommand,
  regCommand,
  turnCommand,
  updateRoomComand,
} from './commands';
import { gameDB } from '../gameDB';

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws, req) => {
  console.log('New client connected');
  console.log('Client IP address:', req.socket.remoteAddress);
  console.log('Client protocol:', ws.protocol);

  let currentPlayer: Player | null = null;

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    const msg = JSON.parse(message.toString()) as Message;
    if (msg.type === 'reg') {
      const regMsg = JSON.parse(msg.data) as RegData;
      const { name, password } = regMsg;

      currentPlayer = playersDB.login(name, password, ws);
      if (currentPlayer) {
        regCommand(currentPlayer, ws);
        updateRoomComand(wss);
      } else {
        errorCommand('reg', 'Wrong password', ws);
      }
    }

    if (msg.type === 'create_room' && currentPlayer) {
      roomsDB.create(currentPlayer);

      updateRoomComand(wss);
    }

    if (msg.type === 'add_user_to_room' && currentPlayer) {
      const addToRoomMsg = JSON.parse(msg.data);
      const { indexRoom } = addToRoomMsg;

      createGameCommand(currentPlayer, indexRoom);

      updateRoomComand(wss);
    }

    if (msg.type === 'add_ships' && currentPlayer) {
      const shipsMsg = JSON.parse(msg.data);
      const { gameId, ships, indexPlayer } = shipsMsg;

      const game = gameDB.addShips(gameId, indexPlayer, ships);

      const isGameReady = game?.gameSet
        .map((set) => set.ships.length)
        .every((length) => length > 0);

      if (isGameReady) {
        const starterPack1 = {
          type: 'start_game',
          data: JSON.stringify({
            ships,
            currentPlayerIndex: indexPlayer,
          }),
        };

        const anotherShips = gameDB.getAnotherPlayerShips(gameId, indexPlayer);
        const anotherId = gameDB.getAnotherPlayerId(gameId, indexPlayer);

        const starterPack2 = {
          type: 'start_game',
          data: JSON.stringify({
            ships: anotherShips,
            currentPlayerIndex: anotherId,
          }),
        };

        playersDB
          .getSocketById(indexPlayer)
          ?.send(JSON.stringify(starterPack1));

        playersDB.getSocketById(anotherId!)?.send(JSON.stringify(starterPack2));

        turnCommand(indexPlayer, gameId);
      }
    }

    if (msg.type === 'attack') {
      const attackMsg = JSON.parse(msg.data) as AttackData;
      const { gameId, x, y, indexPlayer } = attackMsg;

      const game = gameDB.get(gameId);
      const emenyGameBoard = game?.gameSet.find(
        (set) => set.playerId !== indexPlayer
      )?.gameBoard;

      const status = emenyGameBoard?.attack(x, y);
      playersDB.getSocketById(indexPlayer)?.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify({
            position: { x, y },
            currentPlayer: indexPlayer,
            status,
          }),
        })
      );

      const anotherId = gameDB.getAnotherPlayerId(gameId, indexPlayer);
      playersDB.getSocketById(anotherId!)?.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify({
            position: { x, y },
            currentPlayer: indexPlayer,
            status,
          }),
        })
      );

      if (status === 'miss') {
        turnCommand(anotherId!, gameId);
      } else {
        turnCommand(indexPlayer, gameId);
      }
    }

    if (msg.type === 'randomAttack') {
      const attackMsg = JSON.parse(msg.data) as AttackData;
      const { gameId, indexPlayer } = attackMsg;

      const game = gameDB.get(gameId);
      const emenyGameBoard = game?.gameSet.find(
        (set) => set.playerId !== indexPlayer
      )?.gameBoard;

      const randomAttackStatus = emenyGameBoard!.randomAttack();
      const {
        status,
        position: { x, y },
      } = randomAttackStatus;

      playersDB.getSocketById(indexPlayer)?.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify({
            position: { x, y },
            currentPlayer: indexPlayer,
            status,
          }),
        })
      );

      const anotherId = gameDB.getAnotherPlayerId(gameId, indexPlayer);
      playersDB.getSocketById(anotherId!)?.send(
        JSON.stringify({
          type: 'attack',
          data: JSON.stringify({
            position: { x, y },
            currentPlayer: indexPlayer,
            status,
          }),
        })
      );

      if (status === 'miss') {
        turnCommand(anotherId!, gameId);
      } else {
        turnCommand(indexPlayer, gameId);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:3000');
