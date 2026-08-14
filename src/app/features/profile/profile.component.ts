import { Component, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../auth/auth.service';

/**
 * Profile tab — account details and session control. Requires auth.
 */
@Component({
  selector: 'falina-profile',
  standalone: true,
  imports: [IonContent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;

  logout(): void {
    this.auth.logout();
  }
}
