import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const CONTENT_API = 'https://content.dropboxapi.com/2';

export class DropboxNotFoundError extends Error {
  constructor() { super('File not found in Dropbox'); }
}

@Injectable({ providedIn: 'root' })
export class DropboxService {
  private get headers() {
    return { Authorization: `Bearer ${environment.dropboxAccessToken}` };
  }

  async readFile(path: string): Promise<string> {
    const response = await fetch(`${CONTENT_API}/files/download`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Dropbox-API-Arg': JSON.stringify({ path })
      }
    });

    if (response.status === 409) {
      throw new DropboxNotFoundError();
    }

    if (!response.ok) {
      throw new Error(`Dropbox error ${response.status}`);
    }

    return response.text();
  }

  async writeFile(path: string, content: string): Promise<void> {
    const response = await fetch(`${CONTENT_API}/files/upload`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({ path, mode: 'overwrite' })
      },
      body: content
    });

    if (!response.ok) {
      throw new Error(`Dropbox write error ${response.status}`);
    }
  }
}
