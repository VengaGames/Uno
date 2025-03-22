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
}
