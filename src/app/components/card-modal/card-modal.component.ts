import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';

addIcons({ close });

@Component({
  selector: 'app-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonButton, IonButtons, IonToolbar, IonHeader]
})
export class CardModalComponent {
  @Input() image!: string;

  constructor(private modalController: ModalController) {}

  dismissModal() {
    this.modalController.dismiss();
  }
}
