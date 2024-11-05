import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { RubyTextPipe } from '@pipes/ruby-text.pipe';
import { addIcons } from 'ionicons';
import { downloadOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-grid-item',
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    IonLabel,
    IonItem,
    IonAccordion,
    IonAccordionGroup,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardTitle,
    RubyTextPipe
  ]
})
export class GridItemComponent {
  @Input() image!: string;
  @Input() name!: string;
  @Input() progress!: string;
  @Input() isDownloaded!: boolean;
  @Output() download = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  constructor() {
    addIcons({ downloadOutline, trashOutline });
  }
}
