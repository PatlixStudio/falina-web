import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService, readErrorMessage } from '../../../auth/auth.service';

@Component({
  selector: 'falina-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid || this.pending()) {
      return;
    }
    this.pending.set(true);
    this.error.set(null);
    try {
      const { email, password } = this.form.value as { email: string; password: string };
      await this.auth.login(email, password);
      await this.redirectAfterAuth();
    } catch (err) {
      this.error.set(readErrorMessage(err, 'Sign in failed.'));
    } finally {
      this.pending.set(false);
    }
  }

  private async redirectAfterAuth(): Promise<void> {
    const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
    const target = typeof returnUrl === 'string' && returnUrl.startsWith('/') ? returnUrl : '/';
    await this.router.navigateByUrl(target);
  }
}
