export type MsgType = 'reg' | 'update_winners' | 'update_room' | 'create_game';

export interface RegData {
  name: string;
  password: string;
  index?: string;
  error?: boolean;
  errorText?: string;
}

export interface Winner {
  name: string;
  wins: number;
}

export interface Player {
  name: string;
  index: string;
  password?: string;
}

export interface Room {
  roomId: string;
  roomUsers: Player[];
}

export interface Message {
  type: string;
  data: string;
  id: 0;
}

export interface Game {
  ships: Ship[];
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}
