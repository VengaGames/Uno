import type { Card, User } from '../types/databaseType';
import UserDao from '../dao/UserDao';
import CardService from './CardService';
import type { CardById, UserWithCards } from '../types/types';

export default class UserService {
  private static userService: UserService;
  private readonly userDao: UserDao;
  private readonly cardService: CardService;

  private constructor() {
    this.userDao = UserDao.instance;
    this.cardService = CardService.instance;
  }

  public static get instance(): UserService {
    if (!this.userService) {
      this.userService = new UserService();
    }
    return this.userService;
  }

  public async addUserInRoom(userName: string, roomId: number, socketId: string, oldSocketId ?: string): Promise<UserWithCards | undefined> {
    const cardById: CardById = await this.cardService.fetchCardsById();
    if (oldSocketId) {
      const user = await this.userDao.fetchUserBySocketId(oldSocketId);

      if (user) {
        user.socketId = socketId;
        user.userName = userName;
        const cards = await this.cardService.fetchUserCards(user.id);

        const updatedUser = await this.userDao.updateUserSocket(user);
        if (updatedUser) {
          return { ...updatedUser, cards: cards.map((card: Card) => cardById[card.id]) };
        }
      }
    }
    const existingUser = await this.userDao.fetchUserByRoomIdAndName(roomId, userName);
    if (existingUser) {
      return undefined;
    }

    const user = await this.userDao.createUser(userName, roomId, socketId);
    if (user) {
      const cards = await this.cardService.drawCards(7, user.id);
      return { ...user, cards: cards.map((card: Card) => cardById[card.id]) };
    }
    return undefined;
  }

  public async fetchUsersByRoomId(roomId: number): Promise<User[]> {
    return await this.userDao.fetchUsersByRoomId(roomId);
  }

  public async deleteUserBySocketId(socketId: string) {
    const user = await this.userDao.fetchUserBySocketId(socketId);
    await this.userDao.deleteUserBySocketId(socketId);
    return user;
  }

  async fetchUserById(userId: number) {
    const user = await this.userDao.fetchUserById(userId);
    if (!user) {
      return undefined;
    }
    const cards = await this.cardService.fetchUserCards(user.id);
    return { ...user, cards };
  }
}
