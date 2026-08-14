import { Injectable, signal } from '@angular/core';

export type Theme = 'cosmic' | 'warm';

const STORAGE_KEY = 'falina.theme';

/**
 * Toggles between the two dark themes by setting `data-theme` on <html>:
 * "cosmic" (default — deep-space indigo/violet) and "warm" (candlelit
 * charcoal + gold). The palettes live as CSS custom properties in styles.scss.
 * Choice is persisted in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isWarm = signal<boolean>(this.initialTheme() === 'warm');

  constructor() {
    this.apply(this.isWarm());
  }

  toggle(): void {
    this.isWarm.set(!this.isWarm());
    this.apply(this.isWarm());
  }

  private apply(warm: boolean): void {
    document.documentElement.dataset['theme'] = warm ? 'warm' : 'cosmic';
    try {
      localStorage.setItem(STORAGE_KEY, warm ? 'warm' : 'cosmic');
    } catch {
      // storage unavailable — theme still applies for this session
    }
  }

  private initialTheme(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'warm' || saved === 'cosmic') {
        return saved;
      }
    } catch {
      // fall through to default
    }
    return 'cosmic';
  }
}
