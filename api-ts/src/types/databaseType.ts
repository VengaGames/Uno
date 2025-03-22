import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { type CardColors, CardValues, Way } from './types';

export type Database = {
  user: UserTable;
  room: RoomTable;
  card: CardTable;
};

type UserTable = {
  id: Generated<number>;
  socketId: string;
  userName: string;
  roomId: number;
};

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UpdateUser = Updateable<UserTable>;

type RoomTable = {
  id: Generated<number>;
  name: string;
  currentCardId: number | null;
  way: ColumnType<Way, never, Way>;
  creatorId: number | null;
  currentTurnUserId: number | null;
  // stack is the number of cards that the next player has to draw if he doesn't have a card to play (draw 2, draw 4, etc.)
  // default is 0, can be updated
  currentStack: ColumnType<number, never, number>;
};

export type Room = Selectable<RoomTable>;
export type NewRoom = Insertable<RoomTable>;
export type UpdateRoom = Updateable<RoomTable>;

type CardTable = {
  id: Generated<number>;
  value: CardValues;
  color: CardColors;
};

export type Card = Selectable<CardTable>;
export type NewCard = Insertable<CardTable>;
export type UpdateCard = Updateable<CardTable>;