import { GameBoard } from '../gameBoard';

export type MsgType =
  | 'reg'
  | 'update_winners'
  | 'update_room'
  | 'create_room'
  | 'add_user_to_room'
  | 'create_game'
  | 'add_ships'
  | 'start_game'
  | 'attack'
  | 'randomAttack'
  | 'turn'
  | 'finish'
  | 'single_play';

export type AttackStatusType = 'miss' | 'killed' | 'shot';

export interface RegData {
  name: string;
  password: string;
  index?: string;
  error?: boolean;
  errorText?: string;
}

export interface AddUserData {
  indexRoom: string;
}

export interface AddShipsData {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
}

export interface AttackData {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
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
  type: MsgType;
  data: string;
  id: 0;
}

export interface Game {
  id: string;
  gameSet: GameSet[];
  playerTurnId?: string;
}

export interface GameSet {
  playerId: string;
  ships: Ship[];
  gameBoard: GameBoard;
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: string;
}

export interface RandomAttackStatus {
  status: AttackStatusType;
  position: {
    x: number;
    y: number;
  };
}

export interface ShipCell {
  x: number;
  y: number;
  status?: AttackStatusType;
}
