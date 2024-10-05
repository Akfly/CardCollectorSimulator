import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardTitle, IonSelect, IonSelectOption } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonCardContent, IonCard, IonCol, IonRow, IonGrid, IonLabel, IonItem, IonHeader, IonToolbar, IonTitle, IonContent, IonSelect, IonSelectOption],
})
export class HomePage {
  title: string = 'My game';
  games: string[] = ['Game 1', 'Game 2', 'Game 3'];
  selectedGames: string[] = [];
  gridItems: { image: string, name: string, progress: string }[] = [];

  constructor() {}

  onGameSelectionChange(event: any) {
    this.selectedGames = event.target.value;
    this.updateGridItems();
  }

  updateGridItems() {
    // Example logic to update grid items based on selected games
    this.gridItems = this.selectedGames.map(game => ({
      image: 'path/to/image.png',
      name: game,
      progress: '0/150'
    }));
  }
}
