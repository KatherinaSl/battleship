import { Player, Room } from '../common/model';

class RoomsDB {
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

  getRoom(id: string): Room | null {
    return this.rooms.find((room) => room.roomId === id) ?? null;
  }
}

export const roomsDB = new RoomsDB();
