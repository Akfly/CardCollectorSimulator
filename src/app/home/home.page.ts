import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { Game } from '@models/game.interface';
import { GridItemComponent } from '@components/grid-item/grid-item.component';
import { DataService } from '@services/data.service';

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
  selectedGame!: Game;
  gridItems: { id: number; image: string; name: string; progress: string }[] = [];

  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadGames();
  }

  async loadGames() {
    this.games = await this.dataService.getGameList();
  }

  onGameSelectionChange(event: any) {
    const selectedGameId = event.target.value.id;
    this.loadGameDetails(selectedGameId);
  }

  async loadGameDetails(gameId: number) {
    this.selectedGame = await this.dataService.getGameDetail(gameId);
    this.updateGridItems();
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
    const gameId = this.selectedGame.id;
    this.router.navigate(['/set-info', gameId, setId]);
  }
}
