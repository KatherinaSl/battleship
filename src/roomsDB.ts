import { Player, Room } from './model';

export class RoomsDB {
  private rooms: Room[];
  constructor() {
    this.rooms = [];
  }

  create(player: Player) {
    const room = {
      roomId: crypto.randomUUID(),
      roomUsers: [player],
    };
    this.rooms.push(room);
  }

  getOnePlayerRooms(): Room[] {
    return this.rooms.filter((room) => room.roomUsers.length === 1);
  }

  addToRoom(player: Player, id: string) {
    const room = this.rooms.find((room) => room.roomId === id);
    room?.roomUsers.push(player);
    
  }
}

export const roomsDB = new RoomsDB();
