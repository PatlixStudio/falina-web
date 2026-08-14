import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

/**
 * Home splash. Reading entry points live on the Read tab; home is a calm
 * welcome with a single call to action.
 */
@Component({
  selector: 'falina-home',
  standalone: true,
  imports: [RouterLink, IonContent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private readonly auth = inject(AuthService);

  readonly appName = environment.appName;
  readonly tagline = environment.tagline;
  readonly isAuthenticated = this.auth.isAuthenticated;
}
