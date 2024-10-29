import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Game } from '@models/game.interface';
import { FileService } from '@services/file.service';
import { DEFAULT_TOAST } from '@constants/constants';
import { DataService } from '@app/services/data.service';

@Component({
  selector: 'app-download-game-modal',
  templateUrl: './download-game-modal.component.html',
  styleUrls: ['./download-game-modal.component.scss'],
  standalone: true,
  imports: [IonInput, IonLabel, IonItem, IonContent, IonIcon, IonButton, IonButtons, IonTitle, IonToolbar, IonHeader],
  providers: [ToastController]
})
export class DownloadGameModalComponent {
  gameUrl = '';

  get dataFromUrl() {
    const splitted = this.gameUrl.split('/');
    const fileName = splitted.pop();
    const baseUrl = splitted.join('/');
    const gameId = fileName?.replace('.json', '');

    return { baseUrl, fileName, gameId };
  }

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private fileService: FileService,
    private dataService: DataService
  ) {
    addIcons({ close });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  setUrl(event: any) {
    this.gameUrl = event.detail.value;
    if (this.gameUrl.includes('github.com') && this.gameUrl.includes('/blob/')) {
      this.gameUrl = this.gameUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/refs/heads/');
    }
  }

  async addGame() {
    if (!this.gameUrl.includes('.json')) {
      throw new Error('URL must end with .json');
    }

    try {
      const { baseUrl, fileName, gameId } = this.dataFromUrl;
      const game = await this.downloadAllFiles(baseUrl, fileName as string, gameId as string);

      await this.updateGameList(game);

      const toast = await this.toastController.create({ ...DEFAULT_TOAST, message: 'Game added successfully' });
      await toast.present();
    } catch (error) {
      console.error('Error downloading the game', error);
      const toast = await this.toastController.create({ ...DEFAULT_TOAST, message: 'Error downloading the game' });
      await toast.present();
    }

    this.dismissModal();
  }

  async downloadAllFiles(baseUrl: string, fileName: string, gameId: string) {
    const game = (await this.fileService.downloadFile(baseUrl, fileName as string))?.data as Game;

    await this.fileService.downloadFile(baseUrl, `${gameId}/coin.png`, false);

    for (const set of game.setList) {
      await this.fileService.downloadFile(baseUrl, `${gameId}/sets/${set.id}/logo.png`, false);
      await this.fileService.downloadFile(baseUrl, `${gameId}/sets/${set.id}/pack.jpg`, false);
    }

    return game;
  }

  async updateGameList(game: Game) {
    const gameData = (await this.dataService.getGameList()) as { id: number; name: string }[];
    gameData.push({ id: game.id, name: game.name });
    await this.fileService.saveFile('games.json', JSON.stringify(gameData));
    this.dataService.markGamesForRefresh();
  }
}
