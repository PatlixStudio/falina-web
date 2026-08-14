import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import {
  ReadingType,
  findSpread,
  findTarotCard,
  findTarotMeaning,
  humanizeCode,
  type Reading,
} from '@falina/shared';
import { ReadingDraft, ReadingDraftService } from '../../core/reading-draft.service';
import { ReadingsService } from '../../core/readings.service';
import { tarotCardImage } from '../../core/tarot-assets';
import { readErrorMessage } from '../../auth/auth.service';

/**
 * The reading stage. Two modes:
 * - `/reading` — walks a fresh draft from the selection pages: optional
 *   question, then "Reveal" generates and persists a reading via the API.
 * - `/reading/:id` — read-only view of a saved reading (from History).
 */
@Component({
  selector: 'falina-reading',
  standalone: true,
  imports: [RouterLink, IonContent],
  templateUrl: './reading.component.html',
  styleUrls: ['./reading.component.scss'],
})
export class ReadingComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly drafts = inject(ReadingDraftService);
  private readonly readings = inject(ReadingsService);

  viewId = this.route.snapshot.paramMap.get('id');

  readonly draft = this.drafts.draft;
  readonly reading = signal<Reading | null>(null);
  readonly question = signal('');
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  get isView(): boolean {
    return this.viewId !== null;
  }

  async ngOnInit(): Promise<void> {
    if (!this.viewId) {
      return;
    }
    this.loading.set(true);
    try {
      this.reading.set(await this.readings.get(this.viewId));
    } catch (error) {
      this.error.set(readErrorMessage(error, 'This reading could not be loaded.'));
    } finally {
      this.loading.set(false);
    }
  }

  onQuestion(event: Event): void {
    this.question.set((event.target as HTMLTextAreaElement).value);
  }

  async reveal(): Promise<void> {
    const draft = this.draft();
    if (!draft || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      const question = this.question().trim();
      const input = { ...draft, question: question || undefined };
      this.reading.set(await this.readings.create(input));
      this.drafts.clear();
    } catch (error) {
      this.error.set(readErrorMessage(error, 'The oracle could not answer right now.'));
    } finally {
      this.busy.set(false);
    }
  }

  startAnother(): void {
    this.drafts.clear();
    void this.router.navigate(['/read']);
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

  summaryOf(draft: ReadingDraft | null): string[] {
    if (!draft) {
      return [];
    }
    const lines: string[] = [];
    if (draft.intent) {
      lines.push(`Intention: ${draft.intent.replaceAll('_', ' ').toLowerCase()}`);
    }
    if (draft.spreadCode) {
      lines.push(`Spread: ${draft.spreadCode.replaceAll('-', ' ')}`);
    }
    if (draft.cards?.length) {
      const positions = draft.spreadCode ? findSpread(draft.spreadCode)?.positions ?? [] : [];
      draft.cards.forEach((card, index) => {
        const label = positions[index] ? humanizeCode(positions[index]) : `Card ${index + 1}`;
        const name = findTarotCard(card.cardId)?.name ?? card.cardId;
        lines.push(`${label}: ${name} · ${(card.orientation ?? 'UPRIGHT').toLowerCase()}`);
      });
    }
    if (draft.symbols?.length) {
      lines.push(`Symbols: ${draft.symbols.join(', ')}`);
    }
    if (draft.focus) {
      lines.push(`Focus: ${draft.focus.toLowerCase()}`);
    }
    if (draft.birth) {
      const time = draft.birth.birthTime ? ` at ${draft.birth.birthTime}` : '';
      const place = draft.birth.birthLocation ? ` in ${draft.birth.birthLocation}` : '';
      lines.push(`Born ${draft.birth.birthDate}${time}${place}`);
    }
    return lines;
  }

  backRouteOf(draft: ReadingDraft | null): string {
    if (!draft) {
      return '/read';
    }
    switch (draft.type) {
      case 'COFFEE':
        return '/coffee';
      case 'TAROT':
        return '/tarot';
      case 'ASTROLOGY':
        return '/astrology';
    }
  }

  cardChips(
    reading: Reading,
  ): Array<{ heading: string; name: string; orientation: string; cardId: string }> {
    const cards = reading.metadata.cards ?? [];
    return cards.map((card) => ({
      heading: card.label,
      name: card.cardName,
      orientation: card.orientation.toLowerCase(),
      cardId: card.cardId,
    }));
  }

  cardImage(cardId: string): string {
    return tarotCardImage(cardId);
  }

  cardMeaning(card: { cardId: string; orientation: string }): string {
    const meaning = findTarotMeaning(card.cardId);
    if (!meaning) {
      return '';
    }
    return card.orientation === 'reversed' ? meaning.reversed : meaning.upright;
  }

  symbolChips(
    reading: Reading,
  ): Array<{ code: string; keywords: string }> {
    const symbols = reading.metadata.symbols ?? [];
    return symbols.map((symbol) => ({
      code: symbol.code,
      keywords: symbol.keywords.join(', '),
    }));
  }

  metaLine(reading: Reading): string {
    const date = new Date(reading.createdAt);
    const stamp = isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString(undefined, { dateStyle: 'long' });
    return stamp ? `${this.typeLabel(reading.type)} · ${stamp}` : this.typeLabel(reading.type);
  }
}
