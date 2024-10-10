import { Component, Input } from '@angular/core';
import { IonCard, IonCardContent, IonCardTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonCardTitle]
})
export class GridItemComponent {
  @Input() image!: string;
  @Input() name!: string;
  @Input() progress!: string;
}
