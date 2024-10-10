import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from '../models/game.interface';
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
import { GameSet } from '@app/models/game-set.interface';
import { RubyTextPipe } from '@app/pipes/ruby-text.pipe';
import { GridCardComponent } from '../components/grid-card/grid-card.component';

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
    GridCardComponent
  ]
})
export class SetInfoPage implements OnInit {
  gameId!: number;
  setId!: number;
  game!: Game;
  setData!: GameSet;
  cardImages: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.gameId = +params['gameId'];
      this.setId = +params['setId'];
    });

    this.loadData();
  }

  async loadData() {
    this.game = (await this.dataService.getGameDetail(this.gameId)) as Game;
    this.setData = this.game.setList.find(set => set.id === this.setId) as GameSet;

    this.cardImages = this.setData.cardList.map(
      card => `assets/games/${this.game.id}/sets/${this.setData.id}/${card.id}.png`
    );
  }

  openPack() {
    console.log('Opening pack...');
  }
}
