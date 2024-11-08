import { Injectable } from '@angular/core';
import { Game } from '@models/game.interface';
import { GameSet } from '@models/game-set.interface';
import { FileService } from '@services/file.service';
import { DataService } from '@services/data.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadGameService {
  constructor(
    private fileService: FileService,
    private dataService: DataService
  ) {}

  private getDataFromUrl(url: string) {
    const splitted = url.split('/');
    const fileName = splitted.pop();
    const baseUrl = splitted.join('/');
    const gameId = fileName?.replace('.json', '');

    return { baseUrl, fileName, gameId };
  }

  private async downloadAllFiles(baseUrl: string, fileName: string, gameId: string) {
    const game = (await this.fileService.downloadFile(`${baseUrl}/${fileName}`, fileName, { type: 'json' }))
      ?.data as Game;

    const promises: Promise<any>[] = [
      this.fileService.downloadFile(`${baseUrl}/${gameId}/coin.png`, `${gameId}/coin.png`, { type: 'image' }),
      this.fileService.downloadFile(`${baseUrl}/${gameId}/back.jpg`, `${gameId}/back.jpg`, { type: 'image' })
    ];

    for (const set of game.setList) {
      promises.push(
        this.fileService.downloadFile(
          `${baseUrl}/${gameId}/sets/${set.id}/logo.png`,
          `${gameId}/sets/${set.id}/logo.png`,
          { type: 'image' }
        )
      );

      if (set.id === 0) {
        promises.push(this.downloadPromoCards(set, gameId));
      } else {
        promises.push(
          this.fileService.downloadFile(
            `${baseUrl}/${gameId}/sets/${set.id}/pack.jpg`,
            `${gameId}/sets/${set.id}/pack.jpg`,
            { type: 'image' }
          )
        );
      }
    }

    await Promise.all(promises);

    return game;
  }

  private async updateGameList(game: Game, url: string) {
    const gameData = (await this.dataService.getGameList()) as { id: number; name: string; url: string }[];
    const foundId = gameData.find(g => g.id === game.id);

    if (foundId) {
      gameData.splice(gameData.indexOf(foundId), 1);
    }

    gameData.push({ id: game.id, name: game.name, url });
    await this.fileService.saveFile('games.json', JSON.stringify(gameData));
    this.dataService.markGamesForRefresh();
  }

  private async downloadPromoCards(set: GameSet, gameId: string) {
    const promises = [];
    for (const card of set?.cardList || []) {
      promises.push(
        this.fileService.downloadFile(card.imagePath, `${gameId}/sets/${set?.id}/${card.id}.jpg`, {
          type: 'image'
        })
      );
    }

    await Promise.all(promises);
  }

  async downloadFromUrl(url: string) {
    if (!url.includes('.json')) {
      throw new Error('URL must end with .json');
    }

    const { baseUrl, fileName, gameId } = this.getDataFromUrl(url);
    const game = await this.downloadAllFiles(baseUrl, fileName as string, gameId as string);

    await this.updateGameList(game, url);
  }
}
