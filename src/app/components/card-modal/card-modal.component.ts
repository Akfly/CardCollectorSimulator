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
import { SellCardPopupComponent } from '@components/card-modal/sell-card-popup/sell-card-popup.component';
import { Card } from '@models/card.interface';
import { Game } from '@models/game.interface';
import { GameSet } from '@models/game-set.interface';
import { DataService } from '@services/data.service';

addIcons({ close });

@Component({
  selector: 'app-card-modal',
  templateUrl: './card-modal.component.html',
  styleUrls: ['./card-modal.component.scss'],
  standalone: true,
  imports: [IonBackButton, IonContent, IonIcon, IonButton, IonButtons, IonToolbar, IonHeader]
})
export class CardModalComponent {
  @Input() image!: string;
  @Input() card!: Card;
  @Input() game!: Game;
  @Input() set!: GameSet;
  @Input() totalQuantity!: number;
  @Input() isPromoSet!: boolean;

  constructor(
    private modalController: ModalController,
    private dataService: DataService
  ) {
    addIcons({ close });
  }

  async sellCard() {
    const modal = await this.modalController.create({
      component: SellCardPopupComponent,
      componentProps: {
        card: this.card,
        game: this.game,
        set: this.set,
        totalQuantity: this.totalQuantity
      }
    });

    await modal.present();

    const result = await modal.onDidDismiss();

    if (result?.data) {
      this.performSellCard(result.data as number);
    }
  }

  async performSellCard(quantity: number) {
    const cardType = this.card.isSpecial ? 'special' : 'normal';
    const cardPrice = this.game.cardPrices[cardType][this.card.rarity];
    const totalEarned = quantity * (isNaN(cardPrice) ? 0 : cardPrice);
    const currentMoney = parseInt((await this.dataService.getUserData(`userMoney-${this.game.id}`)) || '0', 10);

    const promises = [
      this.dataService.saveUserData(`userMoney-${this.game.id}`, (currentMoney + totalEarned).toString()),
      this.dataService.saveUserData(
        `cardQuantity-${this.game.id}-${this.set.id}-${this.card.id}`,
        (this.totalQuantity - quantity).toString()
      )
    ];

    await Promise.all(promises);
    this.dismissModal(true);
  }

  dismissModal(isSold = false) {
    this.modalController.dismiss(isSold ? 'sold' : 'cancel');
  }
}
