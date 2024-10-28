import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Game } from '@models/game.interface';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private games!: { id: number; name: string }[];
  private gameDetails: { [key: number]: Game } = {};

  private async checkFileExists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        directory: Directory.Documents,
        path
      });
      return true;
    } catch (err: any) {
      if (err.message?.includes('not exist')) {
        return false;
      }
      throw err;
    }
  }

  private async loadGames() {
    const filePath = 'games.json';
    const fileExists = await this.checkFileExists(filePath);

    try {
      if (!fileExists) {
        await Filesystem.writeFile({
          directory: Directory.Documents,
          path: filePath,
          data: JSON.stringify([]),
          encoding: Encoding.UTF8
        });

        this.games = [];
      } else {
        const result = await Filesystem.readFile({
          directory: Directory.Documents,
          path: filePath,
          encoding: Encoding.UTF8
        });

        this.games = JSON.parse(result.data as string);
      }
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
