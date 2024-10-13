import { Component, Input, ElementRef, OnInit, AfterViewInit, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ModalController, GestureController, Gesture } from '@ionic/angular';
import { close, key } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { GameSet } from '@app/models/game-set.interface';
import { Card } from '@app/models/card.interface';

addIcons({ close });

const MIN_SWIPE_DISTANCE = 150;

@Component({
  selector: 'app-booster-pack-modal',
  templateUrl: './booster-pack-modal.component.html',
  styleUrls: ['./booster-pack-modal.component.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonButton, IonButtons, IonToolbar, IonHeader],
  animations: [
    trigger('cardAnimation', [
      state(
        'closed',
        style({
          maxWidth: '{{initialMaxWidth}}'
        }),
        { params: { initialMaxWidth: '50px' } }
      ),
      state(
        'opened',
        style({
          maxWidth: '100%'
        })
      ),
      transition('closed => opened', [animate('1s ease-in-out')])
    ]),
    trigger('cardOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('in => out', [
        animate(
          '0.5s ease-in',
          keyframes([
            style({ transform: 'translateX(0) translateY(0)', offset: 0 }),
            style({ transform: 'translateX({{finalX}}) translateY({{finalY}})', offset: 1 })
          ])
        )
      ])
    ])
  ]
})
export class BoosterPackModalComponent implements OnInit, AfterViewInit {
  @Input() gameId!: number;
  @Input() setData!: GameSet;

  cardImages!: string[];
  boosterPackImage!: string;
  initialMaxWidth!: string;
  isBoosterPackOpened = false;
  currentCardIndex = 0;

  // Properties for swipe functionality
  previousMousePosition: { x?: number; y?: number } = { x: undefined, y: undefined };
  cardOutAnimation: (null | { value: string; params: { finalX: string; finalY: string } })[] = [];
  animationTriggered: boolean[] = [];
  cardInitialPosition!: { left: string; top: string };
  currentActiveCard!: HTMLElement;

  constructor(
    private modalController: ModalController,
    private gestureCtrl: GestureController,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ close });
  }

  ngOnInit() {
    this.initNewPack();
    this.cardOutAnimation = this.cardImages.map(() => null);
  }

  ngAfterViewInit() {
    this.setupGesture();
  }

  initNewPack() {
    this.cardImages = [];
    this.boosterPackImage = `assets/games/${this.gameId}/sets/${this.setData.id}/pack.jpg`;
    this.initialMaxWidth = `${this.setData.boosterPackImageSizePer}%`;

    Object.keys(this.setData.boosterRatio).forEach(key => {
      if (key === 'shared') {
        this.initSharedRarityCards();
      } else {
        this.initNormalRarityCards(key);
      }
    });
  }

  /*
   * This method will initialize the cards that are shared between all rarities.
   * The definition of the shared cards is in the boosterRatio.shared object defined in the game set
   * It has the following format: { total: number, rarities: { [key: string]: number } }
   * Each of the rarities has a number, this number represents the weight of the rarity in the shared pool.
   * The higher the number, the more probably those cards will be selected.
   */
  initSharedRarityCards() {
    const sharedInfo = this.setData.boosterRatio.shared;

    if (!sharedInfo) {
      return;
    }

    const cardsOfCurrentRarities: { [key: string]: Card[] } = {};
    Object.keys(sharedInfo.rarities).forEach(
      rarity => (cardsOfCurrentRarities[rarity] = this.setData.cardList.filter(card => card.rarity === rarity))
    );
    const totalWeight = Object.values(sharedInfo.rarities).reduce((acc, curr) => acc + curr, 0);

    for (let i = 0; i < sharedInfo.total; i++) {
      const randomWeight = Math.floor(Math.random() * totalWeight);
      let currentWeight = 0;
      const selectedRarity = Object.keys(sharedInfo.rarities).find(rarity => {
        currentWeight += sharedInfo.rarities[rarity];
        return randomWeight < currentWeight;
      });

      const currentPool = cardsOfCurrentRarities[selectedRarity as string];
      const selectedCard = currentPool[Math.floor(Math.random() * currentPool.length)];
      this.cardImages.push(`assets/games/${this.gameId}/sets/${this.setData.id}/${selectedCard.id}.jpg`);
    }
  }

  initNormalRarityCards(rarity: string) {
    const cardsOfCurrentRarity = this.setData.cardList.filter(card => card.rarity === rarity);
    for (let i = 0; i < this.setData.boosterRatio[rarity]; i++) {
      const selectedCard = cardsOfCurrentRarity[Math.floor(Math.random() * cardsOfCurrentRarity.length)];
      this.cardImages.push(`assets/games/${this.gameId}/sets/${this.setData.id}/${selectedCard.id}.jpg`);
    }
  }

  setupGesture() {
    const gestureData = {
      el: this.el.nativeElement.querySelector('.booster-pack-modal__content'),
      gestureName: 'swipe',
      maxAngle: 90, // We want every angle possible
      onStart: (ev: any) => this.onSwipeStart(ev),
      onMove: (ev: any) => this.onSwipe(ev),
      onEnd: (ev: any) => this.onSwipeEnd(ev)
    };

    const gestureX = this.gestureCtrl.create({
      ...gestureData,
      direction: 'x'
    });
    gestureX.enable();

    const gestureY = this.gestureCtrl.create({
      ...gestureData,
      direction: 'y'
    });
    gestureY.enable();
  }

  // SWIPE METHODS

  onSwipeStart(event: any) {
    this.previousMousePosition.x = event.startX;
    this.previousMousePosition.y = event.startY;

    this.currentActiveCard = this.el.nativeElement.querySelector('.booster-pack-modal__card.active');

    const computedStyle = getComputedStyle(this.currentActiveCard);
    this.cardInitialPosition = {
      left: computedStyle.left,
      top: computedStyle.top
    };
  }

  onSwipe(event: any) {
    this.cardOutAnimation[this.currentCardIndex] = null;
    this.animationTriggered[this.currentCardIndex] = false;

    // Calculate the current position of the card
    const computedStyle = getComputedStyle(this.currentActiveCard);
    const currentLeft = parseFloat(computedStyle.left.replace('px', ''));
    const currentTop = parseFloat(computedStyle.top.replace('px', ''));
    const finalLeft = currentLeft - ((this.previousMousePosition.x as number) - event.currentX);
    const finalTop = currentTop - ((this.previousMousePosition.y as number) - event.currentY);
    this.renderer.setStyle(this.currentActiveCard, 'left', `${finalLeft}px`);
    this.renderer.setStyle(this.currentActiveCard, 'top', `${finalTop}px`);

    this.previousMousePosition.x = event.currentX;
    this.previousMousePosition.y = event.currentY;
  }

  onSwipeEnd(event: any) {
    this.previousMousePosition = { x: undefined, y: undefined };

    if (Math.abs(event.deltaX) > MIN_SWIPE_DISTANCE || Math.abs(event.deltaY) > MIN_SWIPE_DISTANCE) {
      this.playCardOutAnimation(event.velocityX, event.velocityY);
    } else {
      this.returnCardToInitialPosition();
    }
  }

  // ANIMATION METHODS

  onCardOutDone(event: any, index: number) {
    if (this.animationTriggered[index]) {
      this.animationTriggered[index] = false;
      this.renderer.setStyle(this.currentActiveCard, 'display', 'none');
      this.currentCardIndex++;
    }
  }

  playCardOutAnimation(velocityX: number, velocityY: number) {
    this.animationTriggered[this.currentCardIndex] = true;
    this.cardOutAnimation[this.currentCardIndex] = {
      value: 'out',
      params: { finalX: `${velocityX * 100}vw`, finalY: `${velocityY * 100}vh` }
    };

    this.cdr.markForCheck();
  }

  returnCardToInitialPosition() {
    this.renderer.setStyle(this.currentActiveCard, 'left', this.cardInitialPosition.left);
    this.renderer.setStyle(this.currentActiveCard, 'top', this.cardInitialPosition.top);
  }

  // FUNCTIONALITY METHODS

  dismissModal() {
    this.modalController.dismiss();
  }

  openBoosterPack() {
    this.isBoosterPackOpened = true;
  }
}
