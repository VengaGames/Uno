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

  public async fetchUserBySocketId(socketId: string): Promise<User | undefined> {
    return await db
      .selectFrom('user')
      .selectAll()
      .where('socketId', '=', socketId)
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

  async deleteUserBySocketId(socketId: string) {
    return await db.transaction().execute(trx => {
      trx
        .deleteFrom('userCards')
        .where('userId', '=', eb => eb.selectFrom('user').select('userId').where('socketId', '=', socketId))
        .execute();

      return trx
        .deleteFrom('user')
        .where('socketId', '=', socketId)
        .execute();
    });
  }

  async fetchUserById(userId: number) {
    return await db
      .selectFrom('user')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();
  }
}
