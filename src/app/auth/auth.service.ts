import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { User } from '@falina/shared';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: User;
}

const ACCESS_KEY = 'falina.accessToken';
const REFRESH_KEY = 'falina.refreshToken';

/** Reads the API error body's message into something displayable. */
export function readErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string | string[] } | undefined;
    if (Array.isArray(body?.message)) {
      return body!.message![0];
    }
    if (body?.message) {
      return body.message;
    }
    if (error.status === 0) {
      return 'Cannot reach the Falina API. Is it running?';
    }
  }
  return fallback;
}

/**
 * Owns authentication state: tokens, the current user, and session restore.
 * Restore runs once at app startup via `provideAppInitializer` so guards see
 * a settled session before the first route renders.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly authPending = signal(true);
  readonly isAuthenticated = computed(() => this.user() !== null);

  get accessToken(): string | null {
    return window.localStorage.getItem(ACCESS_KEY);
  }

  private get refreshToken(): string | null {
    return window.localStorage.getItem(REFRESH_KEY);
  }

  /** Restores the session (me → refresh fallback). Safe to call repeatedly. */
  async restore(): Promise<void> {
    if (!this.accessToken) {
      this.authPending.set(false);
      return;
    }
    try {
      const me = await firstValueFrom(
        this.http.get<User>(`${environment.apiBaseUrl}/auth/me`),
      );
      this.user.set(me);
      this.authPending.set(false);
    } catch {
      const ok = await this.tryRefresh();
      if (!ok) {
        this.clearSession();
      }
      this.authPending.set(false);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, {
        email,
        password,
      }),
    );
    this.persist(result);
  }

  async register(displayName: string, email: string, password: string): Promise<void> {
    const result = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, {
        displayName,
        email,
        password,
      }),
    );
    this.persist(result);
  }

  /** Attempts a token refresh; returns true on success. */
  async tryRefresh(): Promise<boolean> {
    const token = this.refreshToken;
    if (!token) {
      return false;
    }
    try {
      const result = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/refresh`, {
          refreshToken: token,
        }),
      );
      this.persist(result);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/auth/login']);
  }

  /** Re-fetches the current user (e.g. after a plan change) and updates state. */
  async refreshUser(): Promise<void> {
    try {
      const me = await firstValueFrom(
        this.http.get<User>(`${environment.apiBaseUrl}/auth/me`),
      );
      this.user.set(me);
    } catch {
      // keep the existing user snapshot — refresh is best-effort
    }
  }

  private persist(result: AuthResponse): void {
    window.localStorage.setItem(ACCESS_KEY, result.accessToken);
    window.localStorage.setItem(REFRESH_KEY, result.refreshToken);
    this.user.set(result.user);
  }

  private clearSession(): void {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    this.user.set(null);
  }
}
