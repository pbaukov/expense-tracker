import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const REFRESH_KEY  = 'dbx_refresh_token';
const ACCESS_KEY   = 'dbx_access_token';
const EXPIRY_KEY   = 'dbx_token_expiry';
const VERIFIER_KEY = 'dbx_code_verifier';

@Injectable({ providedIn: 'root' })
export class AuthService {

  get isAuthenticated(): boolean {
    return !!localStorage.getItem(REFRESH_KEY);
  }

  async getAccessToken(): Promise<string> {
    const expiry = parseInt(localStorage.getItem(EXPIRY_KEY) ?? '0');
    const token  = localStorage.getItem(ACCESS_KEY);
    if (token && Date.now() < expiry - 5 * 60 * 1000) return token;
    return this.refresh();
  }

  async startLogin(): Promise<void> {
    const verifier  = this.randomBase64(32);
    const challenge = await this.sha256base64(verifier);
    sessionStorage.setItem(VERIFIER_KEY, verifier);

    const params = new URLSearchParams({
      client_id: environment.dropboxAppKey,
      response_type: 'code',
      redirect_uri: environment.dropboxRedirectUri,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      token_access_type: 'offline',
    });
    window.location.href = `https://www.dropbox.com/oauth2/authorize?${params}`;
  }

  async handleCallback(code: string): Promise<void> {
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    if (!verifier) throw new Error('Code verifier missing');

    const body = new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: environment.dropboxAppKey,
      redirect_uri: environment.dropboxRedirectUri,
      code_verifier: verifier,
    });

    const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) throw new Error('Token exchange failed');

    const data = await res.json();
    this.store(data.access_token, data.refresh_token, data.expires_in);
    sessionStorage.removeItem(VERIFIER_KEY);
  }

  logout(): void {
    [REFRESH_KEY, ACCESS_KEY, EXPIRY_KEY].forEach(k => localStorage.removeItem(k));
  }

  private async refresh(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    if (!refreshToken) { this.logout(); throw new Error('Not authenticated'); }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: environment.dropboxAppKey,
    });

    const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) { this.logout(); throw new Error('Token refresh failed'); }

    const data = await res.json();
    this.store(data.access_token, data.refresh_token ?? refreshToken, data.expires_in);
    return data.access_token;
  }

  private store(access: string, refresh: string, expiresIn: number): void {
    localStorage.setItem(ACCESS_KEY,  access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(EXPIRY_KEY,  String(Date.now() + expiresIn * 1000));
  }

  private randomBase64(bytes: number): string {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return btoa(String.fromCharCode(...arr))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  private async sha256base64(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
}
