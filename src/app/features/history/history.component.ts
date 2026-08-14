import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ReadingType, type Reading } from '@falina/shared';
import { ReadingsService } from '../../core/readings.service';
import { readErrorMessage } from '../../auth/auth.service';

/**
 * Reading history — the user's journal. Fetches completed readings from the
 * API (newest first) and opens a saved reading at /reading/:id.
 */
@Component({
  selector: 'falina-history',
  standalone: true,
  imports: [RouterLink, IonContent],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
  private readonly readings = inject(ReadingsService);

  readonly items = signal<Reading[]>([]);
  readonly total = signal(0);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const page = await this.readings.list(1, 50);
      this.items.set(page.items);
      this.total.set(page.total);
    } catch (error) {
      this.error.set(readErrorMessage(error, 'Your journal could not be loaded.'));
    } finally {
      this.loading.set(false);
    }
  }

  typeLabel(type: ReadingType): string {
    switch (type) {
      case 'COFFEE':
        return 'Coffee';
      case 'TAROT':
        return 'Tarot';
      case 'ASTROLOGY':
        return 'Astrology';
    }
  }

  dateLabel(createdAt: string): string {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString(undefined, { dateStyle: 'long' });
  }
}
