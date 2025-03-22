import type { Card, User } from './databaseType';

export enum ErrorCodeEnum {
  CREATE_ROOM_FAILED = 'CREATE_ROOM_FAILED',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  CARD_NOT_FOUND = 'CARD_NOT_FOUND',
  CARD_NOT_IN_HAND = 'CARD_NOT_IN_HAND',
}

export enum CardColors {
  RED = 'RED',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  BLACK = 'BLACK',
}

export enum CardValues {
  ONE = '1',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  DRAW_TWO = 'draw2',
  SKIP = 'skip',
  REVERSE = 'reverse',
  WILD = 'wild',
  DRAW_FOUR = 'draw4',
}

export enum Way {
  CLOCKWISE = 'CLOCKWISE',
  COUNTER_CLOCKWISE = 'COUNTER_CLOCKWISE',
}

export type CardById = Record<number, Card>;

export type UserWithCards = User & { cards: Card[] };

export type TokenType = {
  id: number;
  name: string;
  roomId: number;
};
