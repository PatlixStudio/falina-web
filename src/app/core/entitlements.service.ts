import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { EntitlementsView } from '@falina/shared';
import { environment } from '../../environments/environment';

/**
 * Monetization client: tier + entitlements + today's usage, and the
 * self-serve Premium upgrade.
 */
@Injectable({ providedIn: 'root' })
export class EntitlementsService {
  private readonly http = inject(HttpClient);

  get(): Promise<EntitlementsView> {
    return firstValueFrom(
      this.http.get<EntitlementsView>(`${environment.apiBaseUrl}/entitlements`),
    );
  }

  upgrade(productId?: string): Promise<EntitlementsView> {
    return firstValueFrom(
      this.http.post<EntitlementsView>(
        `${environment.apiBaseUrl}/subscriptions/upgrade`,
        { productId },
      ),
    );
  }
}
