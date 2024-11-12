import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { lastValueFrom } from 'rxjs';

const DEFAULT_DIRECTORY = 'CardCollectorSimulator';

interface ReadFileOptions {
  defaultContent?: string;
  outputType?: 'image';
}

@Injectable({
  providedIn: 'root'
})
export class FileService {
  isDirectoryChecked = false;

  get mainDirectory() {
    return `${Directory.Documents}/${DEFAULT_DIRECTORY}`;
  }

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
        } catch (mkdirError: any) {
          if (!mkdirError.message?.includes('Current directory does already exist')) {
            console.error('Unable to create directory', mkdirError);
            throw e;
          }
        }
      } else {
        console.error('Unable to read directory', e);
        throw e;
      }
    }
  }

  private async convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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

  async saveFile(path: string, data: string | Blob, transformToJSON = true) {
    await this.checkDirectoryExists();

    const uri = `${DEFAULT_DIRECTORY}/${path}`;

    await Filesystem.writeFile({
      path: uri,
      data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });

    return { uri, data: transformToJSON ? JSON.parse(data as string) : data };
  }

  async readFile(path: string, options?: ReadFileOptions): Promise<object | string | Blob> {
    await this.checkDirectoryExists();

    if (!(await this.checkFileExists(path))) {
      if (options?.defaultContent) {
        await this.saveFile(path, options.defaultContent);

        return JSON.parse(options.defaultContent);
      }
      throw new Error(`File does not exist: ${path}, options: ${options ?? JSON.stringify(options)}`);
    }

    const result = await Filesystem.readFile({
      path: `${DEFAULT_DIRECTORY}/${path}`,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });

    if (options?.outputType === 'image') {
      return result.data;
    }
    return JSON.parse(result.data as string);
  }

  async downloadFile(url: string, fileName: string, options: { type: 'image' | 'json' | 'text' }) {
    let response: string | Blob;

    try {
      if (options.type === 'image') {
        const result = (await lastValueFrom(this.http.get(url, { responseType: 'blob' }))) as Blob;
        response = await this.convertBlobToBase64(result);
      } else {
        response = (await lastValueFrom(this.http.get(url, { responseType: 'text' }))) as string;
      }
    } catch (error) {
      console.error('Error downloading the file', error);
      throw new Error('Error downloading the file');
    }

    if (fileName.split('/')?.length > 1) {
      const directory = fileName.split('/').slice(0, -1).join('/');
      await this.checkDirectoryExists(`${DEFAULT_DIRECTORY}/${directory}`);
    }

    return this.saveFile(fileName as string, response, options.type === 'json');
  }

  async deleteFile(path: string) {
    await Filesystem.deleteFile({
      path: `${DEFAULT_DIRECTORY}/${path}`,
      directory: Directory.Documents
    });
  }
}
