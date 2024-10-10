import { Component, Input } from '@angular/core';
import { IonCard, IonCardContent, IonCardTitle } from '@ionic/angular/standalone';
import { RubyTextPipe } from '@pipes/ruby-text.pipe';

@Component({
  selector: 'app-grid-card',
  templateUrl: './grid-card.component.html',
  styleUrls: ['./grid-card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonCardTitle, RubyTextPipe]
})
export class GridCardComponent {
  @Input() image!: string;
  @Input() name!: string;
  @Input() quantity!: number;
}
