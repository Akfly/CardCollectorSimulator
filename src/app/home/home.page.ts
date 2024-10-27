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
  IonSelectOption,
  IonImg,
  IonButton,
  IonFooter,
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';
import { GridItemComponent } from '@components/grid-item/grid-item.component';
import { HeaderCoinComponent } from '@components/header-coin/header-coin.component';
import { Game } from '@models/game.interface';
import { DataService } from '@services/data.service';
import { App } from '@capacitor/app';
import { addIcons } from 'ionicons';
import { settingsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButtons,
    IonFooter,
    IonButton,
    IonImg,
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
    GridItemComponent,
    HeaderCoinComponent
  ]
})
export class HomePage implements OnInit {
  title: string = 'Card Collector Simulator';
  games: { id: number; name: string }[] = [];
  selectedGame!: Game;
  gridItems: { id: number; image: string; name: string; progress: string }[] = [];
  currencyImg!: string;
  userMoney!: number;
  versionNumber!: string;

  constructor(
    private router: Router,
    private dataService: DataService
  ) {
    addIcons({ settingsOutline });
  }

  ngOnInit() {
    this.loadGames();
    this.getVersionNumber();
  }

  async getVersionNumber() {
    try {
      const appInfo = await App.getInfo();
      this.versionNumber = `v${appInfo.version}.${appInfo.build}`;
    } catch {
      this.versionNumber = 'Web version';
    }
  }

  async loadGames() {
    this.games = await this.dataService.getGameList();
  }

  onGameSelectionChange(event: any) {
    const selectedGameId = event.target.value.id;
    this.loadGameDetails(selectedGameId);
  }

  async loadGameDetails(gameId: number) {
    const loadGamePromises: any[] = [
      this.dataService.getGameDetail(gameId),
      this.dataService.getUserData(`userMoney-${gameId}`)
    ];
    const [game, userMoney] = await Promise.all(loadGamePromises);

    this.selectedGame = game;
    this.currencyImg = `assets/games/${gameId}/coin.png`;
    this.userMoney = parseInt(userMoney, 10) || 0;
    this.updateGridItems();
  }

  async updateGridItems() {
    if (this.selectedGame) {
      const quantitiesPromises: any[] = [];

      this.gridItems = this.selectedGame.setList.map(set => {
        quantitiesPromises.push(this.dataService.getUserData(`setQuantity-${this.selectedGame.id}-${set.id}`));

        return {
          id: set.id,
          image: `assets/games/${this.selectedGame.id}/sets/${set.id}/logo.png`,
          name: set.name,
          progress: ''
        };
      });

      const quantitiesResponse = await Promise.all(quantitiesPromises);

      this.gridItems.forEach((item, index) => {
        item.progress = `${quantitiesResponse[index] || 0}/${this.selectedGame.setList[index].cardList.length}`;
      });
    } else {
      this.gridItems = [];
    }
  }

  onSetClick(setId: number) {
    const gameId = this.selectedGame.id;
    this.router.navigate(['/set-info', gameId, setId]);
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }
}
