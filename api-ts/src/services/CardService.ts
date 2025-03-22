import type { Card } from '../types/databaseType';
import CardDao from '../dao/CardDao';
import type { CardById } from '../types/types';

export default class CardService {
  private static cardService: CardService;
  private readonly cardDao: CardDao;

  private constructor() {
    this.cardDao = CardDao.instance;
  }

  public static get instance(): CardService {
    if (!this.cardService) {
      this.cardService = new CardService();
    }
    return this.cardService;
  }

  public async drawCards(cardNb: number, userId: number): Promise<Card[]> {
    const cards = await this.cardDao.drawCards(cardNb);
    await this.cardDao.insertUserCards(cards.map(card => card.id), userId);
    return cards;
  }

  public async fetchUserCards(userId: number): Promise<Card[]> {
    return this.cardDao.fetchUserCards(userId);
  }

  public async drawCard(): Promise<Card | undefined> {
    return this.cardDao.drawCard();
  }

  public async fetchCardsById(): Promise<CardById> {
    return (await this.cardDao.fetchAll())
      .reduce((acc: CardById, card: Card) => ({ ...acc, [card.id]: card }), {});
  }
}

