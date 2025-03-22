import type { Card } from '../types/databaseType';
import CardDao from '../dao/CardDao';

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

  public async drawCards(cardNb: number): Promise<Card[]> {
    return this.cardDao.drawCards(cardNb);
  }

  public async drawCard(): Promise<Card | undefined> {
    return this.cardDao.drawCard();
  }
}

