import type { Card, User } from './databaseType';

export enum ErrorCodes {
  CREATE_ROOM_FAILED = 'CREATE_ROOM_FAILED',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
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

export type CardBody = Omit<Card, "id">;
export type CardById = Record<number, CardBody>;

export type UserWithCards = User & { cards: CardBody[] };
