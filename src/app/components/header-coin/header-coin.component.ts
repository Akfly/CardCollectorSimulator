import { Component, Input } from '@angular/core';
import { IonItem, IonImg, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-header-coin',
  templateUrl: './header-coin.component.html',
  styleUrls: ['./header-coin.component.scss'],
  standalone: true,
  imports: [IonLabel, IonImg, IonItem]
})
export class HeaderCoinComponent {
  @Input() img!: string;
  @Input() amount!: number | string;
}
