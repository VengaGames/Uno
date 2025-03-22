import type { User } from '../types/databaseType';
import { db } from '../database';

export default class UserDao {
  private static userDao: UserDao;

  private constructor() {
  }

  public static get instance(): UserDao {
    if (!this.userDao) {
      this.userDao = new UserDao();
    }
    return this.userDao;
  }

  public async fetchUserByRoomAndSocketId(roomId: number, socketId: string): Promise<User | undefined> {
    return await db
      .selectFrom('user')
      .selectAll()
      .where('socketId', '=', socketId)
      .where('roomId', '=', roomId)
      .executeTakeFirst();
  }

  public async createUser(userName: string, roomId: number, socketId: string): Promise<User | undefined> {
    return await db
      .insertInto('user')
      .values({ userName, roomId, socketId })
      .returningAll()
      .executeTakeFirst();
  }

  public async updateUserSocket(user: User): Promise<User | undefined> {
    return await db
      .updateTable('user')
      .set({ socketId: user.socketId, userName: user.userName })
      .where('id', '=', user.id)
      .returningAll()
      .executeTakeFirst();
  }

  public async fetchUserByRoomIdAndName(roomId: number, userName: string) {
    return await db
      .selectFrom('user')
      .selectAll()
      .where('roomId', '=', roomId)
      .where('userName', '=', userName)
      .executeTakeFirst();
  }

  async fetchUsersByRoomId(roomId: number) {
    return await db
      .selectFrom('user')
      .selectAll()
      .where('roomId', '=', roomId)
      .execute();
  }
}
