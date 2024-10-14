import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';
import { Game } from '@models/game.interface';
import { DataService } from '@services/data.service';
import {
  IonHeader,
  IonButtons,
  IonToolbar,
  IonBackButton,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonGrid,
  IonCol,
  IonRow
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { GameSet } from '@app/models/game-set.interface';
import { RubyTextPipe } from '@app/pipes/ruby-text.pipe';
import { GridCardComponent } from '@components/grid-card/grid-card.component';
import { HeaderCoinComponent } from '@components/header-coin/header-coin.component';
import { SECONDS_TO_NEXT_PACK } from '@app/constants/constants';
import { CardModalComponent } from '@components/card-modal/card-modal.component';
import { BoosterPackModalComponent } from '@components/booster-pack-modal/booster-pack-modal.component';
import { Card } from '@models/card.interface';

@Component({
  selector: 'app-set-info',
  templateUrl: './set-info.page.html',
  styleUrls: ['./set-info.page.scss'],
  standalone: true,
  imports: [
    IonRow,
    IonCol,
    IonGrid,
    IonCardTitle,
    IonCardContent,
    IonCard,
    IonItem,
    IonButton,
    IonContent,
    IonTitle,
    IonBackButton,
    IonToolbar,
    IonButtons,
    IonHeader,
    RubyTextPipe,
    GridCardComponent,
    HeaderCoinComponent
  ],
  providers: [ModalController]
})
export class SetInfoPage implements OnInit {
  gameId!: number;
  setId!: number;
  game!: Game;
  setData!: GameSet;
  cardsData: { id: number; image: string; quantity: number }[] = [];
  currencyImg!: string;
  userMoney!: number;
  lastFreePackDate!: DateTime;

  get canGetFreePack() {
    const diff = DateTime.now().diff(this.lastFreePackDate, ['seconds']).seconds;

    return diff >= SECONDS_TO_NEXT_PACK;
  }

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = +params['gameId'];
      this.setId = +params['setId'];
    });

    this.loadData();
  }

  async loadData() {
    const loadDataPromises: any[] = [
      this.dataService.getGameDetail(this.gameId),
      this.dataService.getUserData(`userMoney-${this.gameId}`),
      this.dataService.getUserData(`lastFreePack-${this.gameId}`)
    ];
    const [game, userMoney, lastFreePack] = await Promise.all(loadDataPromises);

    this.game = game;
    this.currencyImg = `assets/games/${this.gameId}/coin.png`;
    this.userMoney = parseInt(userMoney, 10) || 0;
    this.lastFreePackDate = DateTime.fromISO(lastFreePack ?? '1000-01-01T00:00:00Z');
    this.setData = this.game.setList.find(set => set.id === this.setId) as GameSet;

    const cardDataPromises: any[] = this.setData.cardList.map(card =>
      this.dataService.getUserData(`cardQuantity-${this.gameId}-${this.setId}-${card.id}`)
    );
    const cardQuantities = await Promise.all(cardDataPromises);

    this.cardsData = this.setData.cardList.map((card, index) => ({
      id: card.id,
      image: `assets/games/${this.game.id}/sets/${this.setData.id}/${card.id}.jpg`,
      quantity: cardQuantities[index] || 0
    }));
  }

  async openCardModal(cardData: { image: string; quantity: number }) {
    if (cardData.quantity <= 0) {
      return;
    }

    const modal = await this.modalController.create({
      component: CardModalComponent,
      componentProps: { image: cardData.image },
      cssClass: 'card-modal'
    });
    return await modal.present();
  }

  async openPack() {
    const modal = await this.modalController.create({
      component: BoosterPackModalComponent,
      componentProps: {
        setData: this.setData,
        gameId: this.gameId
      },
      cssClass: 'card-modal'
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    const cardDataPromises: any[] = data.cardIdList.map((cardId: number) =>
      this.dataService.getUserData(`cardQuantity-${this.gameId}-${this.setId}-${cardId}`)
    );
    const cardQuantities = await Promise.all(cardDataPromises);

    data.cardIdList.forEach((cardId: number, index: number) => {
      this.cardsData.find(card => card.id === cardId)!.quantity = parseInt(cardQuantities[index] || '0', 10);
    });
  }
}
