import { Hono } from 'hono';
import RoomService from '../services/RoomService';
import UserService from '../services/UserService';
import { ErrorCodeEnum, type TokenType, type UserWithCards } from '../types/types';
import CardService from '../services/CardService';

const userController = new Hono()
const roomService: RoomService = RoomService.instance;
const userService: UserService = UserService.instance;
const cardService: CardService = CardService.instance;

userController.post(('/play-card/:cardId'), async (c) => {
  const cardId: number = Number(c.req.param('cardId'));
  const userToken: TokenType = c.get('jwtPayload');
  const user: UserWithCards | undefined = await userService.fetchUserById(userToken.id);

  if (!user) {
    return c.json({ errorCode: ErrorCodeEnum.USER_NOT_FOUND }, 404);
  }
  const room = await roomService.fetchRoomById(userToken.roomId)
  if (!room) {
    return c.json({ errorCode: ErrorCodeEnum.ROOM_NOT_FOUND }, 404);
  }

  if (room.currentTurnUserId !== user.id) {
    return c.json({ errorCode: ErrorCodeEnum.NOT_YOUR_TURN }, 400);
  }

  const card = await cardService.fetchCardById(cardId);
  if (!user.cards.map((card) => card.id).includes(card.id)) {
    return c.json({ errorCode: ErrorCodeEnum.CARD_NOT_FOUND }, 404);
  }
  await cardService.deleteCardById(card.id, user.id);
  const updatedRoom = await roomService.playCard(userToken.roomId, userToken.id, cardId);
  return c.json(updatedRoom)
})