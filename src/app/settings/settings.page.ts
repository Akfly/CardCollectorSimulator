import { Component, OnInit } from '@angular/core';
import { Filesystem, Encoding } from '@capacitor/filesystem';
import { ModalController, ToastController } from '@ionic/angular';
import {
  IonButtons,
  IonHeader,
  IonToolbar,
  IonBackButton,
  IonTitle,
  IonContent,
  IonList,
  IonListHeader,
  IonLabel,
  IonItem,
  IonToggle
} from '@ionic/angular/standalone';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { DownloadGameModalComponent } from '@components/download-game-modal/download-game-modal.component';
import { DEFAULT_TOAST } from '@constants/constants';
import { DataService } from '@services/data.service';
import { DownloadGameService } from '@services/download-game.service';
import { FileService } from '@services/file.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
    IonToggle,
    IonItem,
    IonLabel,
    IonListHeader,
    IonList,
    IonContent,
    IonTitle,
    IonBackButton,
    IonToolbar,
    IonHeader,
    IonButtons
  ],
  providers: [ToastController, FileChooser, ModalController]
})
export class SettingsPage implements OnInit {
  hideUnobtainedCards!: boolean;

  constructor(
    private dataService: DataService,
    private toastController: ToastController,
    private fileChooser: FileChooser,
    private modalController: ModalController,
    private fileService: FileService,
    private downloadGameService: DownloadGameService
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  async loadSettings() {
    this.hideUnobtainedCards = (await this.dataService.getUserData('settings-hideUnobtainedCards')) === 'true';
  }

  async exportSaveFile() {
    const data = await this.dataService.exportUserData();

    try {
      const result = await this.fileService.saveFile('savefile', data);

      // Show a toast message with the directory
      const toast = await this.toastController.create({
        ...DEFAULT_TOAST,
        message: `File saved to: ${result.uri}`
      });
      await toast.present();
    } catch (e) {
      console.error('Unable to write file', e);
    }
  }

  async importSaveFile() {
    try {
      const uri = await this.fileChooser.open();

      // Read the file
      const file = await Filesystem.readFile({
        path: uri,
        encoding: Encoding.UTF8
      });

      const jsonData = JSON.parse(file.data as string);
      await this.dataService.importUserData(jsonData);

      // Show a toast message indicating success
      const toast = await this.toastController.create({
        ...DEFAULT_TOAST,
        message: 'File imported successfully'
      });
      await toast.present();
    } catch (e) {
      console.error('Unable to read file', e);

      // Show a toast message indicating failure
      const toast = await this.toastController.create({
        ...DEFAULT_TOAST,
        message: 'Failed to import file'
      });
      await toast.present();
    }
  }

  async addGame() {
    const modal = await this.modalController.create({
      component: DownloadGameModalComponent,
      cssClass: 'card-modal'
    });

    await modal.present();
    await modal.onDidDismiss();
  }

  async updateGames() {
    const games = (await this.dataService.getGameList()) as { id: number; name: string; url: string }[];
    for (const game of games) {
      if (game.url) {
        try {
          this.downloadGameService.downloadFromUrl(game.url);

          const toast = await this.toastController.create({ ...DEFAULT_TOAST, message: `${game.name} updated` });
          await toast.present();
        } catch (error) {
          console.error(`Error downloading ${game.name}`, error);
          const toast = await this.toastController.create({
            ...DEFAULT_TOAST,
            message: `Error downloading ${game.name}`
          });
          await toast.present();
        }
      }
    }
  }

  async saveSettingValue(key: string, value: any) {
    await this.dataService.saveUserData(key, value.toString());
  }
}
