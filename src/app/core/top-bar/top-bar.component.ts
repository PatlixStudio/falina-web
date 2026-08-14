import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flameOutline, sparklesOutline } from 'ionicons/icons';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../theme.service';

addIcons({ flameOutline, sparklesOutline });

/**
 * Slim brand bar: wordmark (home) on the left, session state on the right,
 * plus a Cosmic/Ember theme toggle.
 */
@Component({
  selector: 'falina-top-bar',
  standalone: true,
  imports: [RouterLink, IonIcon],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent {
  private readonly auth = inject(AuthService);
  private readonly themes = inject(ThemeService);

  readonly appName = environment.appName;
  readonly user = this.auth.user;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly isWarm = this.themes.isWarm;

  logout(): void {
    this.auth.logout();
  }

  toggleTheme(): void {
    this.themes.toggle();
  }
}
