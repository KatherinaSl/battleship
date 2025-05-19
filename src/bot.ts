import { AddShipsData } from './common/model';

export function generateAddShipsByBot(gameId: string): AddShipsData {
  return {
    gameId,
    ships: shipsPositions[0],
    indexPlayer: 'bot',
  };
}

const shipsPositions = [
  [
    { position: { x: 4, y: 8 }, direction: false, type: 'huge', length: 4 },
    { position: { x: 7, y: 0 }, direction: true, type: 'large', length: 3 },
    { position: { x: 0, y: 8 }, direction: false, type: 'large', length: 3 },
    { position: { x: 2, y: 5 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 0, y: 3 }, direction: false, type: 'medium', length: 2 },
    { position: { x: 6, y: 4 }, direction: true, type: 'medium', length: 2 },
    { position: { x: 9, y: 7 }, direction: false, type: 'small', length: 1 },
    { position: { x: 8, y: 4 }, direction: false, type: 'small', length: 1 },
    { position: { x: 0, y: 5 }, direction: false, type: 'small', length: 1 },
    { position: { x: 9, y: 9 }, direction: false, type: 'small', length: 1 },
  ],
];
