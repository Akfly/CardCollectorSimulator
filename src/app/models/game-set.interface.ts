import { Card } from '@models/card.interface';

export interface GameSet {
  id: number;
  name: string;
  imagePath: string;
  cardList: Card[];
  releaseDate: string;
  boosterPackImageSizePer: number;
  boosterRatio: { shared?: { total: number; rarities: { [key: string]: number } }; [key: string]: number | any };
}
