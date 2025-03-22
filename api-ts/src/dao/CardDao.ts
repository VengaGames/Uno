import type { Card } from '../types/databaseType';
import { db } from '../database';

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
}
