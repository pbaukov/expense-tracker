import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  ready = false;

  constructor(public auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      await this.auth.handleCallback(code);
      // Clean up the URL after OAuth redirect
      window.history.replaceState({}, '', window.location.pathname);
    }

    this.ready = true;
  }
}
