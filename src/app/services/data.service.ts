import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Game } from '@models/game.interface';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileService } from '@services/file.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private games!: { id: number; name: string }[] | undefined;
  private gameDetails: { [key: number]: Game } = {};

  constructor(private fileService: FileService) {}

  private async loadGames() {
    try {
      this.games = (await this.fileService.readFile('games.json', '[]')) as { id: number; name: string }[];
    } catch {
      console.error('Error handling games.json');
      this.games = [];
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

  markGamesForRefresh() {
    this.games = undefined;
    this.gameDetails = {};
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

  getUserData = async (key: string) => {
    return (await Preferences.get({ key })).value;
  };

  saveUserData = async (key: string, value: string) => {
    await Preferences.set({ key, value });
  };

  exportUserData = async () => {
    const { keys } = await Preferences.keys();

    const preferences = await Promise.all(
      keys.map(async key => {
        const { value } = await Preferences.get({ key });
        return { [key]: value };
      })
    );

    const preferencesObject = preferences.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    return JSON.stringify(preferencesObject);
  };

  importUserData = async (data: { [key: string]: string }) => {
    await Preferences.clear();

    await Promise.all(
      Object.keys(data).map(async key => {
        await Preferences.set({ key, value: data[key] });
      })
    );
  };
}
