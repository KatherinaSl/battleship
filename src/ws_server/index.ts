import { WebSocketServer } from 'ws';
import { Message, Player, RegData } from '../model';
import { playersDB } from '../playersDB';
import { roomsDB } from '../roomsDB';

const wss = new WebSocketServer({ port: 3000 });

//smth

wss.on('connection', (ws, req) => {
  console.log('New client connected');
  console.log('Client IP address:', req.socket.remoteAddress);
  console.log('Client protocol:', ws.protocol);

  let player: Player | null = null;

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    const msg = JSON.parse(message.toString()) as Message;
    if (msg.type === 'reg') {
      const regMsg = JSON.parse(msg.data) as RegData;
      const { name, password } = regMsg;

      player = playersDB.login(name, password);
      if (player) {
        const answerData = {
          type: 'reg',
          data: JSON.stringify(player),
        };

        ws.send(JSON.stringify(answerData));
        //player + ws -> smth
        const updateRoomMsg = {
          type: 'update_room',
          data: JSON.stringify(roomsDB.getOnePlayerRooms()),
        };
        wss.clients.forEach((ws) => ws.send(JSON.stringify(updateRoomMsg)));
      } else {
        const answerError = {
          type: 'reg',
          data: JSON.stringify({
            error: true,
            errorText: 'Wrong password',
          }),
        };
        ws.send(JSON.stringify(answerError));
      }
    }

    if (msg.type === 'create_room' && player) {
      roomsDB.create(player);

      const updateRoomMsg = {
        type: 'update_room',
        data: JSON.stringify(roomsDB.getOnePlayerRooms()),
      };
      wss.clients.forEach((ws) => ws.send(JSON.stringify(updateRoomMsg)));
    }

    if (msg.type === 'add_user_to_room' && player) {
      const addToRoomMsg = JSON.parse(msg.data);
      const { indexRoom } = addToRoomMsg;

      roomsDB.addToRoom(player, indexRoom);
      const updateRoomMsg = {
        type: 'update_room',
        data: JSON.stringify(roomsDB.getOnePlayerRooms()),
      };
      wss.clients.forEach((ws) => ws.send(JSON.stringify(updateRoomMsg)));

      // const createGame = {
      //   type: 'create_game',
      //   data: JSON.stringify({
      //     idGame: crypto.randomUUID(),
      //     idPlayer: player.index,
      //   }),
      // };
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:3000');
