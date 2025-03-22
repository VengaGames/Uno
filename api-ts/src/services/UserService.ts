import type { User } from '../types/databaseType';
import UserDao from '../dao/UserDao';

export default class UserService {
  private static userService: UserService;
  private readonly userDao: UserDao;

  private constructor() {
    this.userDao = UserDao.instance;
  }

  public static get instance(): UserService {
    if (!this.userService) {
      this.userService = new UserService();
    }
    return this.userService;
  }

  public async addUserInRoom(userName: string, roomId: number, socketId: string, oldSocketId ?: string): Promise<User | undefined> {
    if (oldSocketId) {
      const user = await this.userDao.fetchUserByRoomAndSocketId(roomId, oldSocketId);

      if (user) {
        user.socketId = socketId;
        user.userName = userName;
        return await this.userDao.updateUserSocket(user);
      }
    }
    const existingUser = await this.userDao.fetchUserByRoomIdAndName(roomId, userName);
    if (existingUser) {
      return undefined;
    }

    return this.userDao.createUser(userName, roomId, socketId);
  }
  
  public async fetchUsersByRoomId(roomId: number): Promise<User[]> {
    return await this.userDao.fetchUsersByRoomId(roomId);
  }
}
