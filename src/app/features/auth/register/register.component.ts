import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService, readErrorMessage } from '../../../auth/auth.service';

@Component({
  selector: 'falina-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    displayName: new FormControl('', [Validators.maxLength(60)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirm: new FormControl('', [Validators.required]),
  });

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid || this.pending()) {
      return;
    }
    if (this.form.value.password !== this.form.value.confirm) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.pending.set(true);
    this.error.set(null);
    const { displayName, email, password } = this.form.value as {
      displayName: string;
      email: string;
      password: string;
    };
    void this.auth
      .register(displayName, email, password)
      .then(() => this.router.navigate(['/']))
      .catch((err: unknown) => this.error.set(readErrorMessage(err, 'Registration failed.')))
      .finally(() => this.pending.set(false));
  }
}
