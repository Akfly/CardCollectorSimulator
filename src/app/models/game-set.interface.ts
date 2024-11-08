import { Card } from '@models/card.interface';

export interface GameSet {
  id: number;
  name: string;
  imagePath: string;
  cardList: Card[];
  releaseDate: string;
  previousSetDate: string;
  boosterPackImageSizePer: number;
  borderRadius: string;
  boosterPrice?: number;
  boosterRatio: { shared?: { total: number; rarities: { [key: string]: number } }; [key: string]: number | any };
}
