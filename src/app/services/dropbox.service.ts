import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const API = 'https://api.dropboxapi.com/2';
const CONTENT_API = 'https://content.dropboxapi.com/2';

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

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw err;
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
      throw await response.json().catch(() => ({}));
    }
  }
}
