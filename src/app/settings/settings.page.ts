import { Component } from '@angular/core';
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
  IonItem
} from '@ionic/angular/standalone';
import { DataService } from '@services/data.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { ToastController } from '@ionic/angular';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { DEFAULT_TOAST } from '@constants/constants';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [
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
  providers: [ToastController, FileChooser]
})
export class SettingsPage {
  constructor(
    private dataService: DataService,
    private toastController: ToastController,
    private fileChooser: FileChooser
  ) {}

  async checkCreateDirectory() {
    try {
      // Check if the directory exists
      await Filesystem.readdir({
        path: 'card-collector-simulator',
        directory: Directory.Documents
      });
    } catch (e: any) {
      // If the directory does not exist, create it
      if (e.message === 'Directory does not exist') {
        try {
          await Filesystem.mkdir({
            path: 'card-collector-simulator',
            directory: Directory.Documents
          });
        } catch (mkdirError) {
          console.error('Unable to create directory', mkdirError);
          return;
        }
      } else {
        console.error('Unable to read directory', e);
        return;
      }
    }
  }

  async exportSaveFile() {
    const data = await this.dataService.exportUserData();

    try {
      await this.checkCreateDirectory();

      const result = await Filesystem.writeFile({
        path: 'card-collector-simulator/savefile',
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });

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
}
