import { Component, Input } from '@angular/core';
import { IonCard, IonCardContent, IonCardTitle } from '@ionic/angular/standalone';
import { RubyTextPipe } from 'src/app/pipes/ruby-text.pipe';

@Component({
  selector: 'app-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonCardTitle, RubyTextPipe]
})
export class GridItemComponent {
  @Input() image!: string;
  @Input() name!: string;
  @Input() progress!: string;
}
