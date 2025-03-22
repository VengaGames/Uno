import type { Card } from '../types/databaseType';
import { db } from '../database';
import { ErrorCodeEnum } from '../types/types';

export default class CardDao {
  private static cardDao: CardDao;

  private constructor() {
  }

  public static get instance(): CardDao {
    if (!this.cardDao) {
      this.cardDao = new CardDao();
    }
    return this.cardDao;
  }

  public async drawCards(cardNb: number): Promise<Card[]> {
    return await db
      .selectFrom('card')
      .selectAll()
      .execute();
  }

  public async drawCard() {
    return await db
      .selectFrom('card')
      .selectAll()
      .executeTakeFirst();
  }

  public async fetchAll() {
    return await db
      .selectFrom('card')
      .selectAll()
      .execute();
  }

  public async fetchUserCards(userId: number): Promise<Card[]> {
    return await db
      .selectFrom('card')
      .innerJoin('userCards', 'card.id', 'userCards.cardId')
      .select(['card.value', 'card.color', 'card.id'])
      .where('userId', '=', userId)
      .execute();
  }

  async insertUserCards(cardIds: number[], userId: number) {
    return await db
      .insertInto('userCards')
      .values(cardIds.map(cardId => ({ cardId, userId })))
      .execute();
  }

  async fetchCardById(cardId: number) {
    return await db
      .selectFrom('card')
      .selectAll()
      .where('id', '=', cardId)
      .executeTakeFirstOrThrow(node => new Error(ErrorCodeEnum.CARD_NOT_FOUND));
  }

  async deleteCardById(cardId: number, userId: number) {
    return await db
      .deleteFrom('userCards')
      .where('cardId', '=', cardId)
      .where('userId', '=', userId)
      .execute();
  }
}
