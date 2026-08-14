import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CoffeeAnalyzeResult,
  CreateReadingInput,
  Page,
  Reading,
} from '@falina/shared';
import { environment } from '../../environments/environment';

/**
 * Talks to the readings API: generating new readings and fetching the user's
 * journal. The server does all generation work — this client only sends the
 * selected draft and renders what comes back.
 */
@Injectable({ providedIn: 'root' })
export class ReadingsService {
  private readonly http = inject(HttpClient);

  create(input: CreateReadingInput): Promise<Reading> {
    return firstValueFrom(
      this.http.post<Reading>(`${environment.apiBaseUrl}/readings`, input),
    );
  }

  /** Sends a coffee-cup photo for vision analysis and returns detected symbols. */
  analyzeCoffee(imageDataUrl: string): Promise<CoffeeAnalyzeResult> {
    return firstValueFrom(
      this.http.post<CoffeeAnalyzeResult>(
        `${environment.apiBaseUrl}/readings/coffee/analyze`,
        { imageDataUrl },
      ),
    );
  }

  list(page = 1, pageSize = 20): Promise<Page<Reading>> {
    return firstValueFrom(
      this.http.get<Page<Reading>>(`${environment.apiBaseUrl}/readings`, {
        params: { page: String(page), pageSize: String(pageSize) },
      }),
    );
  }

  get(id: string): Promise<Reading> {
    return firstValueFrom(
      this.http.get<Reading>(`${environment.apiBaseUrl}/readings/${id}`),
    );
  }
}
