import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { unlerp } from '@utils/utils';
import { PromoModalComponent } from '@components/promo-modal/promo-modal.component';
import { FileService } from '@services/file.service';

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
export class SetInfoPage implements OnInit, OnDestroy {
  gameId!: number;
  setId!: number;
  game!: Game;
  setData!: GameSet;
  cardsData: { id: number; image: string; quantity: number }[] = [];
  currencyImg!: string;
  userMoney!: number;
  lastFreePackDate!: DateTime;
  availablePromoCards!: { card: Card; percentage: number }[];
  timeToNextPack!: string;
  timerInterval!: ReturnType<typeof setInterval>;

  get canGetFreePack() {
    const diff = DateTime.now().diff(this.lastFreePackDate, ['seconds']).seconds;

    return diff >= SECONDS_TO_NEXT_PACK;
  }

  get isPromoSet() {
    return this.setId === 0;
  }

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private fileService: FileService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = +params['gameId'];
      this.setId = +params['setId'];
    });

    this.loadData();
    this.startPackInterval();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  async loadData() {
    const loadDataPromises: any[] = [
      this.dataService.getGameDetail(this.gameId),
      this.dataService.getUserData(`userMoney-${this.gameId}`),
      this.dataService.getUserData(`lastFreePack-${this.gameId}`)
    ];
    const [game, userMoney, lastFreePack] = await Promise.all(loadDataPromises);

    this.game = game;
    this.currencyImg = (await this.fileService.readFile(`${this.gameId}/coin.png`, { outputType: 'image' })) as string;
    this.userMoney = parseInt(userMoney, 10) || 0;
    this.lastFreePackDate = DateTime.fromISO(lastFreePack ?? '1000-01-01T00:00:00Z');
    this.setData = this.game.setList.find(set => set.id === this.setId) as GameSet;

    const cardDataPromises: any[] = this.setData.cardList.map(card =>
      this.dataService.getUserData(`cardQuantity-${this.gameId}-${this.setId}-${card.id}`)
    );
    const cardImagePromises: any[] = this.setData.cardList.map(card =>
      this.fileService.readFile(`${this.gameId}/sets/${this.setId}/${card.id}.jpg`, { outputType: 'image' })
    );
    const [cardQuantities, imagesResponse] = await Promise.all([
      Promise.all(cardDataPromises),
      Promise.all(cardImagePromises)
    ]);
    let setQuantity = 0;

    this.cardsData = this.setData.cardList.map((card, index) => {
      const cardQuantity = parseInt(cardQuantities[index] || '0', 10);

      if (cardQuantity) {
        setQuantity++;
      }

      return {
        id: card.id,
        image: imagesResponse[index],
        quantity: cardQuantity
      };
    });

    this.dataService.saveUserData(`setQuantity-${this.gameId}-${this.setData.id}`, setQuantity.toString());

    const promoSet = this.game.setList.find(set => set.id === 0);
    const filteredPromos = promoSet?.cardList.filter(card => {
      return (
        DateTime.fromISO(card.releaseDate) >= DateTime.fromISO(this.setData.previousSetDate) &&
        DateTime.fromISO(card.releaseDate) <= DateTime.fromISO(this.setData.releaseDate)
      );
    });
    this.availablePromoCards =
      (filteredPromos || []).map(card => {
        const initDate = DateTime.fromISO(this.setData.previousSetDate).toSeconds();
        const finalDate = DateTime.fromISO(this.setData.releaseDate).toSeconds();
        const cardDate = DateTime.fromISO(card.releaseDate).toSeconds();

        return { card, percentage: unlerp(initDate, finalDate, cardDate) };
      }) || [];

    const promoPromises = this.availablePromoCards.map(data =>
      this.dataService.getUserData(`cardQuantity-${this.gameId}-0-${data.card.id}`)
    );
    const promoQuantities = await Promise.all(promoPromises);
    this.availablePromoCards = this.availablePromoCards.filter(
      (data, index) => parseInt(promoQuantities[index] || '0', 10) === 0
    );
  }

  startPackInterval() {
    this.timerInterval = setInterval(() => {
      const nextDate = this.lastFreePackDate.plus({ seconds: SECONDS_TO_NEXT_PACK });
      const diff = nextDate.diff(DateTime.now(), ['seconds']);
      this.timeToNextPack = diff.toFormat('hh:mm:ss');
    }, 1000);
  }

  async openCardModal(cardData: { image: string; quantity: number }, card: Card) {
    if (cardData.quantity <= 0) {
      return;
    }

    const modal = await this.modalController.create({
      component: CardModalComponent,
      componentProps: {
        image: cardData.image,
        card: card,
        game: this.game,
        set: this.setData,
        totalQuantity: cardData.quantity,
        isPromoSet: this.isPromoSet
      },
      cssClass: 'card-modal'
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data === 'sold') {
      await this.loadData();
      this.cdr.markForCheck();
    }
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

    if (data.cardIdList && this.canGetFreePack) {
      this.lastFreePackDate = DateTime.now();
      this.dataService.saveUserData(`lastFreePack-${this.gameId}`, this.lastFreePackDate.toISO() as string);
    }

    const cardDataPromises: any[] = data.cardIdList.map((cardId: number) =>
      this.dataService.getUserData(`cardQuantity-${this.gameId}-${this.setId}-${cardId}`)
    );
    const cardQuantities = await Promise.all(cardDataPromises);

    data.cardIdList.forEach((cardId: number, index: number) => {
      this.cardsData.find(card => card.id === cardId)!.quantity = parseInt(cardQuantities[index] || '0', 10);
    });

    const totalCards = this.cardsData.reduce((acc, card) => acc + (card.quantity > 0 ? 1 : 0), 0);
    const totalCardPercentage = totalCards / this.cardsData.length;
    const promosToGet = this.availablePromoCards.filter(promo => promo.percentage <= totalCardPercentage);

    if (promosToGet.length) {
      this.earnPromos(promosToGet);
    }
  }

  async earnPromos(promosToGet: { card: Card; percentage: number }[]) {
    let setQuantity = parseInt((await this.dataService.getUserData(`setQuantity-${this.gameId}-0`)) || '0', 10);

    promosToGet.forEach(promo => {
      setQuantity++;
      this.dataService.saveUserData(`cardQuantity-${this.gameId}-0-${promo.card.id}`, '1');
    });

    this.dataService.saveUserData(`setQuantity-${this.gameId}-o`, setQuantity.toString());

    this.cdr.markForCheck();

    promosToGet.forEach(async promo => {
      const image = (await this.fileService.readFile(`${this.game.id}/sets/0/${promo.card.id}.jpg`, {
        outputType: 'image'
      })) as string;
      const modal = await this.modalController.create({
        component: PromoModalComponent,
        componentProps: { image },
        cssClass: 'card-modal'
      });

      await modal.present();
      await modal.onDidDismiss();
    });
  }
}
