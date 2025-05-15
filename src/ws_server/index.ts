import { WebSocketServer } from 'ws';
import { Message, Player, RegData } from '../model';
import { playersDB } from '../playersDB';
import { roomsDB } from '../roomsDB';
import {
  createGameCommand,
  errorCommand,
  regCommand,
  updateRoomComand,
} from './commands';

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
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:3000');
