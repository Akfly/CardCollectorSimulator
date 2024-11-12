import { Component, Input } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { SellCardPopupComponent } from '@components/card-modal/sell-card-popup/sell-card-popup.component';
import { Card } from '@models/card.interface';
import { Game } from '@models/game.interface';
import { GameSet } from '@models/game-set.interface';
import { DataService } from '@services/data.service';

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
    private loadingController: LoadingController,
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
    const loading = await this.loadingController.create();
    await loading.present();

    try {
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
    } catch (error) {
      console.error('Error selling the card', error);
    } finally {
      await loading.dismiss();
    }
    this.dismissModal(true);
  }

  dismissModal(isSold = false) {
    this.modalController.dismiss(isSold ? 'sold' : 'cancel');
  }
}
