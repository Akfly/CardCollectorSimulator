import { Component, OnInit } from '@angular/core';
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
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { Game } from '../models/game.interface';
import { GridItemComponent } from '../components/grid-item/grid-item.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonSelectOption,
    GridItemComponent
  ]
})
export class HomePage implements OnInit {
  title: string = 'Card Collector Simulator';
  games: { id: number; name: string }[] = [];
  selectedGame: Game | null = null;
  gridItems: { id: number; image: string; name: string; progress: string }[] = [];

  constructor() {}

  ngOnInit() {
    this.loadGames();
  }

  async loadGames() {
    try {
      const response = await fetch('assets/games.json');
      const data = await response.json();
      this.games = data;
    } catch (err) {
      console.error('Error reading games.json', err);
    }
  }

  onGameSelectionChange(event: any) {
    const selectedGameId = event.target.value.id;
    this.loadGameDetails(selectedGameId);
  }

  async loadGameDetails(gameId: number) {
    try {
      const response = await fetch(`assets/games/${gameId}.json`);
      const data = await response.json();
      this.selectedGame = data;
      this.updateGridItems();
    } catch (err) {
      console.error(`Error reading ${gameId}.json`, err);
    }
  }

  async updateGridItems() {
    if (this.selectedGame) {
      this.gridItems = this.selectedGame.setList.map(set => ({
        id: set.id,
        image: `assets/games/${this.selectedGame?.id}/sets/${set.id}/logo.png`,
        name: set.name,
        progress: `0/${set.cardList.length}`
      }));
    } else {
      this.gridItems = [];
    }
  }

  onSetClick(setId: number) {
    console.log(`Set ${setId} clicked`);
  }
}
