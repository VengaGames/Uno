import type { Room, User } from '../types/databaseType';
import RoomDao from '../dao/RoomDao';
import CardService from './CardService';
import UserService from './UserService';

export default class RoomService {
  private static roomService: RoomService;
  private readonly roomDao: RoomDao;
  private readonly cardService: CardService;
  private readonly userService: UserService;

  private constructor() {
    this.roomDao = RoomDao.instance
    this.cardService = CardService.instance
    this.userService = UserService.instance
  }

  public static get instance(): RoomService {
    if (!this.roomService) {
      this.roomService = new RoomService();
    }
    return this.roomService;
  }

  public async fetchRoomByName(roomName: string): Promise<Room | undefined> {
    const room = await this.roomDao.fetchRoomByName(roomName);
    if (room) {
      return room;
    }
    return this.roomDao.createRoom(roomName);
  }

  public async initiateRoom(roomId: number, userId: number) {
    const defaultCard = await this.cardService.drawCard();
    if (!defaultCard) {
      // TODO: Handle this error
      throw new Error('No card available');
    }
    return await this.roomDao.initiateRoom(roomId, userId, defaultCard.id);
  }

  async fetchRoomById(roomId: number) {
    return await this.roomDao.fetchRoomById(roomId);

  }

  async deleteRoomById(roomId: number) {
    return await this.roomDao.deleteRoom(roomId);
  }

  async incrementAndGetNextPlayerTurn(id: number): Promise<number> {
    const room = await this.roomDao.fetchRoomById(id);
    if (!room) {
      // TODO: Handle this error
      throw new Error('Room not found');
    }
    const users: User[] = await this.userService.fetchUsersByRoomId(id);
    const currentTurnUserIndex = users.findIndex(user => user.id === room.currentTurnUserId);
    
    const nextUserIndex = (currentTurnUserIndex + 1) % users.length;
    const nextUser = users[nextUserIndex];
    await this.roomDao.updateCurrentTurnUserId(room.id, nextUser.id);
    return nextUser.id;
  }
}

