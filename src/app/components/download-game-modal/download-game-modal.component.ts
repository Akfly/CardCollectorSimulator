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
import { DEFAULT_TOAST } from '@constants/constants';
import { DownloadGameService } from '@services/download-game.service';

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
    private downloadGameService: DownloadGameService
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
    try {
      this.downloadGameService.downloadFromUrl(this.gameUrl);

      const toast = await this.toastController.create({ ...DEFAULT_TOAST, message: 'Game added successfully' });
      await toast.present();
    } catch (error) {
      console.error('Error downloading the game', error);
      const toast = await this.toastController.create({ ...DEFAULT_TOAST, message: 'Error downloading the game' });
      await toast.present();
    }

    this.dismissModal();
  }
}
