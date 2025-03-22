import type { Room } from '../types/databaseType';
import RoomDao from '../dao/RoomDao';
import CardService from './CardService';

export default class RoomService {
  private static roomService: RoomService;
  private readonly roomDao: RoomDao;
  private readonly cardService: CardService;

  private constructor() {
    this.roomDao = RoomDao.instance
    this.cardService = CardService.instance
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
}

