import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonBackButton
} from '@ionic/angular/standalone';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { DataService } from '@services/data.service';

addIcons({ close });

@Component({
  selector: 'app-card-modal',
  templateUrl: './promo-modal.component.html',
  styleUrls: ['./promo-modal.component.scss'],
  standalone: true,
  imports: [IonBackButton, IonContent, IonIcon, IonButton, IonButtons, IonToolbar, IonHeader]
})
export class PromoModalComponent {
  @Input() image!: string;

  constructor(private modalController: ModalController) {
    addIcons({ close });
  }

  dismissModal() {
    this.modalController.dismiss();
  }
}
