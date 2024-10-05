import { Card } from '../models/card.interface';

export interface GameSet {
  id: number;
  name: string;
  imagePath: string;
  cardList: Card[];
}
