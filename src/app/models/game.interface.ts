import { GameSet } from '@models/game-set.interface';

export interface Game {
  id: number;
  name: string;
  url: string;
  coinName: string;
  coinImagePath: string;
  setList: GameSet[];
  cardRarityOrder: string[];
  cardPrices: { normal: { [key: string]: number }; special: { [key: string]: number } };
}
