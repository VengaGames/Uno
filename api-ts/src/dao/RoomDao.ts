import type { Room } from '../types/databaseType';
import { db } from '../database';

export default class RoomDao {
  private static roomDao: RoomDao;

  private constructor() {
  }

  public static get instance(): RoomDao {
    if (!this.roomDao) {
      this.roomDao = new RoomDao();
    }
    return this.roomDao;
  }

  public async fetchRoomByName(roomName: string): Promise<Room | undefined> {
    return await db
      .selectFrom('room')
      .selectAll()
      .where('name', '=', roomName)
      .executeTakeFirst();
  }

  public async createRoom(roomName: string): Promise<Room | undefined> {
    return await db
      .insertInto('room')
      .values({ name: roomName })
      .returningAll()
      .executeTakeFirst();
  }

  public async initiateRoom(roomId: number, userId: number, defaultCardId: number) {
    return await db
      .updateTable('room')
      .set({ creatorId: userId, currentTurnUserId: userId, currentCardId: defaultCardId })
      .where('id', '=', roomId)
      .returningAll()
      .executeTakeFirst();
  }

  async fetchRoomById(roomId: number) {
    return await db
      .selectFrom('room')
      .selectAll()
      .where('id', '=', roomId)
      .executeTakeFirstOrThrow();
  }

  async deleteRoom(roomId: number) {
    return await db
      .deleteFrom('room')
      .where('id', '=', roomId)
      .execute();
  }

  async updateCurrentTurnUserId(roomId: number, userId: number) {
    return await db
      .updateTable('room')
      .set({ currentTurnUserId: userId })
      .where('id', '=', roomId)
      .returningAll()
      .executeTakeFirst();
  }

  async updateCurrentCardId(roomId: number, cardId: number) {
    return await db
      .updateTable('room')
      .set({ currentCardId: cardId })
      .where('id', '=', roomId)
      .returningAll()
      .executeTakeFirst();
  }
}
