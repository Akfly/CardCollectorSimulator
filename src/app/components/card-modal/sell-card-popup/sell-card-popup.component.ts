import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { close } from 'ionicons/icons';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonFooter,
  IonRange
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { Card } from '@models/card.interface';
import { Game } from '@models/game.interface';
import { GameSet } from '@models/game-set.interface';
import { RubyTextPipe } from '@pipes/ruby-text.pipe';

@Component({
  selector: 'app-sell-card-popup',
  templateUrl: './sell-card-popup.component.html',
  styleUrls: ['./sell-card-popup.component.scss'],
  standalone: true,
  imports: [
    IonRange,
    IonFooter,
    IonInput,
    IonLabel,
    IonItem,
    IonContent,
    IonButton,
    IonIcon,
    IonButtons,
    IonTitle,
    IonToolbar,
    IonHeader,
    RubyTextPipe
  ]
})
export class SellCardPopupComponent implements OnInit {
  @Input() card!: Card;
  @Input() game!: Game;
  @Input() set!: GameSet;
  @Input() totalQuantity!: number;

  quantity!: number;
  cardPrice!: number;

  constructor(private modalController: ModalController) {
    addIcons({ close });
  }

  ngOnInit() {
    const cardType = this.card.isSpecial ? 'special' : 'normal';
    this.cardPrice = this.game.cardPrices[cardType][this.card.rarity];
    this.quantity = 1;
  }

  onChangeRange(event: CustomEvent) {
    this.quantity = event.detail.value as number;
  }

  dismiss() {
    this.modalController.dismiss();
  }

  accept() {
    this.modalController.dismiss(this.quantity);
  }
}
