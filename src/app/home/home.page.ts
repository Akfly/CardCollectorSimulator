import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';

interface Card {
  id: number;
  name: string;
  rarity: string;
  imagePath: string;
}

interface GameSet {
  id: number;
  name: string;
  imagePath: string;
  cardList: Card[];
}

interface Game {
  id: number;
  name: string;
  coinName: string;
  coinImagePath: string;
  setList: GameSet[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCardTitle,
    IonCardContent,
    IonCard,
    IonCol,
    IonRow,
    IonGrid,
    IonLabel,
    IonItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSelect,
    IonSelectOption
  ]
})
export class HomePage {
  title: string = 'My game';
  games: Game[] = [
    {
      id: 1,
      name: 'Game 1',
      coinName: 'Coin 1',
      coinImagePath: 'path/to/coin1.png',
      setList: [
        {
          id: 1,
          name: 'Set 1',
          imagePath: 'path/to/set1.png',
          cardList: [
            { id: 1, name: 'Card 1', rarity: 'Common', imagePath: 'path/to/card1.png' },
            { id: 2, name: 'Card 2', rarity: 'Rare', imagePath: 'path/to/card2.png' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Game 2',
      coinName: 'Coin 2',
      coinImagePath: 'path/to/coin2.png',
      setList: [
        {
          id: 2,
          name: 'Set 2',
          imagePath: 'path/to/set2.png',
          cardList: [
            { id: 3, name: 'Card 3', rarity: 'Common', imagePath: 'path/to/card3.png' },
            { id: 4, name: 'Card 4', rarity: 'Rare', imagePath: 'path/to/card4.png' }
          ]
        }
      ]
    }
  ];
  selectedGame: Game | null = null;
  gridItems: { image: string; name: string; progress: string }[] = [];

  constructor() {}

  onGameSelectionChange(event: any) {
    this.selectedGame = event.target.value;
    this.updateGridItems();
  }

  updateGridItems() {
    if (this.selectedGame) {
      this.gridItems = this.selectedGame.setList.map(set => ({
        image: set.imagePath,
        name: set.name,
        progress: `0/${set.cardList.length}`
      }));
    } else {
      this.gridItems = [];
    }
  }
}
