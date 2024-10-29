import { Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const DEFAULT_DIRECTORY = 'CardCollectorSimulator';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  isDirectoryChecked = false;

  constructor(private http: HttpClient) {}

  private async checkDirectoryExists(path = DEFAULT_DIRECTORY) {
    if (path === DEFAULT_DIRECTORY && this.isDirectoryChecked) {
      return;
    }

    try {
      // Check if the directory exists
      await Filesystem.readdir({
        path,
        directory: Directory.Documents
      });

      if (path === DEFAULT_DIRECTORY) {
        this.isDirectoryChecked = true;
      }
    } catch (e: any) {
      // If the directory does not exist, create it
      if (e.message?.includes('does not exist')) {
        try {
          await Filesystem.mkdir({
            path,
            directory: Directory.Documents,
            recursive: true
          });

          if (path === DEFAULT_DIRECTORY) {
            this.isDirectoryChecked = true;
          }
        } catch (mkdirError) {
          console.error('Unable to create directory', mkdirError);
          return;
        }
      } else {
        console.error('Unable to read directory', e);
        return;
      }
    }
  }

  async checkFileExists(path: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        directory: Directory.Documents,
        path: `${DEFAULT_DIRECTORY}/${path}`
      });
      return true;
    } catch (err: any) {
      if (err.message?.includes('not exist')) {
        return false;
      }
      throw err;
    }
  }

  async saveFile(path: string, data: string, transformToJSON = true) {
    await this.checkDirectoryExists();

    const uri = `${DEFAULT_DIRECTORY}/${path}`;

    await Filesystem.writeFile({
      path: uri,
      data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });

    return { uri, data: transformToJSON ? JSON.parse(data) : data };
  }

  async readFile(path: string, defaultContent: string | null = null): Promise<object> {
    await this.checkDirectoryExists();

    if (!(await this.checkFileExists(path))) {
      if (defaultContent) {
        await this.saveFile(path, defaultContent);

        return JSON.parse(defaultContent);
      }
      throw new Error('File does not exist');
    }

    const result = await Filesystem.readFile({
      path: `${DEFAULT_DIRECTORY}/${path}`,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });

    return JSON.parse(result.data as string);
  }

  async downloadFile(baseUrl: string, fileName: string, transformToJSON = true) {
    let response = '';
    const url = `${baseUrl}/${fileName}`;

    try {
      response = await lastValueFrom(this.http.get(url, { responseType: 'text' }));
    } catch (error) {
      console.error('Error downloading the file', error);
      throw new Error('Error downloading the file');
    }

    if (fileName.split('/')?.length > 1) {
      const directory = fileName.split('/').slice(0, -1).join('/');
      await this.checkDirectoryExists(`${DEFAULT_DIRECTORY}/${directory}`);
    }

    return this.saveFile(fileName as string, response, transformToJSON);
  }
}
