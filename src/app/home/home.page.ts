import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { GridItemComponent } from '@components/grid-item/grid-item.component';
import { HeaderCoinComponent } from '@components/header-coin/header-coin.component';
import { Game } from '@models/game.interface';
import { DataService } from '@services/data.service';
import { App } from '@capacitor/app';
import { addIcons } from 'ionicons';
import { settingsOutline } from 'ionicons/icons';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FileService } from '@services/file.service';
import { ToastController } from '@ionic/angular';
import { DEFAULT_TOAST } from '@constants/constants';

declare global {
  interface Navigator {
    app: {
      exitApp: () => void;
    };
  }
}

interface GridItem {
  id: number;
  image: string;
  name: string;
  progress: string;
  isDownloaded: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
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
export class HomePage implements OnInit, OnDestroy {
  title: string = 'Card Collector Simulator';
  games: { id: number; name: string }[] = [];
  selectedGame!: Game;
  gridItems: GridItem[] = [];
  currencyImg!: string;
  userMoney!: number;
  versionNumber!: string;
  backButtonSubscription!: Subscription;

  constructor(
    private router: Router,
    private dataService: DataService,
    private fileService: FileService,
    private platform: Platform,
    private toastController: ToastController
  ) {
    addIcons({ settingsOutline });
    this.initializeBackButtonCustomHandler();
  }

  ngOnInit() {
    this.loadGames();
    this.getVersionNumber();
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  initializeBackButtonCustomHandler(): void {
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      navigator['app'].exitApp();
    });
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
    this.games = (await this.dataService.getGameList()) as { id: number; name: string }[];
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
    this.currencyImg = (await this.fileService.readFile(`${gameId}/coin.png`, { outputType: 'image' })) as string;
    this.userMoney = parseInt(userMoney, 10) || 0;
    this.updateGridItems();
  }

  async updateGridItems() {
    if (this.selectedGame) {
      const quantitiesPromises: any[] = [];
      const imagePromises: any[] = [];

      this.gridItems = this.selectedGame.setList.map(set => {
        quantitiesPromises.push(this.dataService.getUserData(`setQuantity-${this.selectedGame.id}-${set.id}`));
        imagePromises.push(
          this.fileService.readFile(`${this.selectedGame.id}/sets/${set.id}/logo.png`, { outputType: 'image' })
        );

        return {
          id: set.id,
          image: '',
          name: set.name,
          progress: '',
          isDownloaded: false
        };
      });

      const [quantitiesResponse, imagesResponse] = await Promise.all([
        Promise.all(quantitiesPromises),
        Promise.all(imagePromises)
      ]);

      this.gridItems.forEach((item, index) => {
        item.progress = `${quantitiesResponse[index] || 0}/${this.selectedGame.setList[index].cardList.length}`;
        item.image = imagesResponse[index];
        this.checkIfSetIsDownloaded(item);
      });
    } else {
      this.gridItems = [];
    }
  }

  async checkIfSetIsDownloaded(item: GridItem) {
    const isDownloaded = await this.dataService.getUserData(`isDownloaded-${this.selectedGame.id}-${item.id}`);
    item.isDownloaded = item.id === 0 || isDownloaded === 'true';
  }

  onSetClick(item: GridItem) {
    if (!item.isDownloaded) {
      return;
    }

    const gameId = this.selectedGame.id;
    this.router.navigate(['/set-info', gameId, item.id]);
  }

  async onDownloadSetClick(item: GridItem) {
    const set = this.selectedGame.setList.find(s => s.id === item.id);

    try {
      const promises = [];
      for (const card of set?.cardList || []) {
        promises.push(
          this.fileService.downloadFile(card.imagePath, `${this.selectedGame.id}/sets/${set?.id}/${card.id}.jpg`, {
            type: 'image'
          })
        );
      }

      await Promise.all(promises);
      item.isDownloaded = true;
      this.dataService.saveUserData(`isDownloaded-${this.selectedGame.id}-${item.id}`, 'true');

      const toast = await this.toastController.create({
        ...DEFAULT_TOAST,
        message: `${item.name} downloaded successfully`
      });
      await toast.present();
    } catch (error) {
      console.error('Error downloading set', error);
      const toast = await this.toastController.create({ ...DEFAULT_TOAST, message: `Error downloading ${item.name}` });
      await toast.present();
    }
  }

  async onRemoveSetClick(item: GridItem) {
    const set = this.selectedGame.setList.find(s => s.id === item.id);

    try {
      const promises = set?.cardList.map(card =>
        this.fileService.deleteFile(`${this.selectedGame.id}/sets/${set?.id}/${card.id}.jpg`)
      );
      await Promise.all(promises || []);

      item.isDownloaded = false;
      this.dataService.saveUserData(`isDownloaded-${this.selectedGame.id}-${item.id}`, 'false');

      const toast = await this.toastController.create({
        ...DEFAULT_TOAST,
        message: `${item.name} removed successfully`
      });
      await toast.present();
    } catch (error) {
      console.error('Error removing set', error);
      const toast = await this.toastController.create({ ...DEFAULT_TOAST, message: `Error removing ${item.name}` });
      await toast.present();
    }
  }

  openSettings() {
    this.router.navigate(['/settings']);
  }
}
