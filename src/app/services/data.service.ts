import { Injectable } from '@angular/core';
import { Game } from '../models/game.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private games!: { id: number; name: string }[];
  private gameDetails: { [key: number]: Game } = {};

  private async loadGames() {
    try {
      const response = await fetch('assets/games.json');
      const data = await response.json();
      this.games = data;
    } catch (err) {
      console.error('Error reading games.json', err);
    }
  }

  private async loadGameDetails(gameId: number) {
    try {
      const response = await fetch(`assets/games/${gameId}.json`);
      const data = await response.json();
      this.gameDetails[gameId] = data;
    } catch (err) {
      console.error(`Error reading ${gameId}.json`, err);
    }
  }

  getGameList = async () => {
    if (!this.games) {
      await this.loadGames();
    }

    return this.games;
  };

  getGameDetail = async (gameId: number) => {
    if (!this.gameDetails[gameId]) {
      await this.loadGameDetails(gameId);
    }

    return this.gameDetails[gameId];
  };
}
