import { GameSet } from '@models/game-set.interface';

export interface Game {
  id: number;
  name: string;
  coinName: string;
  coinImagePath: string;
  setList: GameSet[];
  cardPrices: { normal: { [key: string]: number }; special: { [key: string]: number } };
}
