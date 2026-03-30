import { Injectable } from '@angular/core';
import { Dropbox } from 'dropbox';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DropboxService {
  private dbx = new Dropbox({ accessToken: environment.dropboxAccessToken });

  async readFile(path: string): Promise<string> {
    const response = await this.dbx.filesDownload({ path }) as any;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(response.result.fileBlob);
    });
  }

  async writeFile(path: string, content: string): Promise<void> {
    const blob = new Blob([content], { type: 'text/csv' });
    await this.dbx.filesUpload({
      path,
      contents: blob,
      mode: { '.tag': 'overwrite' }
    });
  }
}
