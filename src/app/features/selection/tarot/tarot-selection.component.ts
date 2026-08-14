import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import {
  TAROT_CARDS,
  TAROT_INTENTS,
  findSpread,
  findTarotCard,
  humanizeCode,
  type TarotIntent,
} from '@falina/shared';
import { AuthService } from '../../../auth/auth.service';
import { ReadingDraftService } from '../../../core/reading-draft.service';
import { tarotCardImage } from '../../../core/tarot-assets';

type DeckPhase = 'pick' | 'revealed';

interface GridCard {
  cardId: string;
  orientation: 'UPRIGHT' | 'REVERSED';
  /** Selection order: 0 = not picked, otherwise 1…N in the spread's positions. */
  picked: number;
}

interface SpreadOption {
  code: string;
  cardCount: number;
  label: string;
  positions: string[];
  premium: boolean;
}

const SPREADS: SpreadOption[] = [
  {
    code: 'three-past-present-future',
    cardCount: 3,
    label: 'Past, present & future',
    positions: ['PAST', 'PRESENT', 'FUTURE'],
    premium: false,
  },
  {
    code: 'five-card',
    cardCount: 5,
    label: 'Situation, challenge, influence, advice & outcome',
    positions: ['SITUATION', 'CHALLENGE', 'HIDDEN_INFLUENCE', 'ADVICE', 'OUTCOME'],
    premium: false,
  },
  {
    code: 'celtic-cross',
    cardCount: 10,
    label: 'The Celtic Cross — the full story',
    positions: [
      'SELF',
      'CROSSING',
      'FOUNDATION',
      'RECENT_PAST',
      'CROWN',
      'IMMEDIATE_FUTURE',
      'SELF_ATTITUDE',
      'ENVIRONMENT',
      'HOPES_FEARS',
      'OUTCOME',
    ],
    premium: true,
  },
];

@Component({
  selector: 'falina-tarot-selection',
  standalone: true,
  imports: [RouterLink, IonContent],
  templateUrl: './tarot-selection.component.html',
  styleUrls: ['./tarot-selection.component.scss'],
})
export class TarotSelectionComponent {
  private readonly router = inject(Router);
  private readonly drafts = inject(ReadingDraftService);
  private readonly auth = inject(AuthService);

  readonly intents = TAROT_INTENTS;
  readonly humanize = humanizeCode;
  readonly spreadOptions = SPREADS;

  readonly phase = signal<DeckPhase>('pick');
  readonly intent = signal<TarotIntent | null>(null);
  readonly spreadCode = signal(SPREADS[0].code);
  readonly showUpgrade = signal(false);
  readonly pickLimit = computed(
    () => findSpread(this.spreadCode())?.cardCount ?? SPREADS[0].cardCount,
  );
  readonly grid = signal<GridCard[]>(this.shuffleDeck());
  readonly isPremium = computed(
    () => this.auth.user()?.plan === 'PREMIUM' || this.auth.user()?.role === 'ADMIN',
  );

  selectSpread(code: string): void {
    const spread = SPREADS.find((s) => s.code === code);
    if (!spread) {
      return;
    }
    if (spread.premium && !this.isPremium()) {
      this.showUpgrade.set(true);
      return;
    }
    this.showUpgrade.set(false);
    if (this.spreadCode() === code) {
      return;
    }
    this.spreadCode.set(code);
    this.reshuffle();
  }

  closeUpgrade(): void {
    this.showUpgrade.set(false);
  }

  togglePick(index: number): void {
    if (this.phase() !== 'pick') {
      return;
    }
    const limit = this.pickLimit();
    this.grid.update((cards) => {
      const next = cards.map((card) => ({ ...card }));
      const card = next[index];
      if (card.picked > 0) {
        const dropped = card.picked;
        card.picked = 0;
        for (const other of next) {
          if (other.picked > dropped) {
            other.picked -= 1;
          }
        }
      } else if (this.selectedCount() < limit) {
        card.picked = this.selectedCount() + 1;
      }
      return next;
    });
  }

  reshuffle(): void {
    this.phase.set('pick');
    this.grid.set(this.shuffleDeck());
  }

  reveal(): void {
    if (this.selectedCount() === this.pickLimit() && this.phase() === 'pick') {
      this.phase.set('revealed');
    }
  }

  begin(): void {
    if (this.phase() !== 'revealed') {
      return;
    }
    const cards = this.pickedCards().map((card) => ({
      cardId: card.cardId,
      orientation: card.orientation,
    }));
    this.drafts.set({
      type: 'TAROT',
      intent: this.intent() ?? 'GENERAL',
      spreadCode: this.spreadCode(),
      cards,
    });
    void this.router.navigate(['/reading']);
  }

  pickedCards(): GridCard[] {
    return this.grid()
      .filter((card) => card.picked > 0)
      .sort((a, b) => a.picked - b.picked);
  }

  selectedCount(): number {
    return this.grid().filter((card) => card.picked > 0).length;
  }

  positionLabelForPick(pick: number): string {
    const positions = findSpread(this.spreadCode())?.positions ?? [];
    return humanizeCode(positions[pick - 1] ?? '');
  }

  cardName(cardId: string): string {
    return findTarotCard(cardId)?.name ?? cardId;
  }

  cardImage(cardId: string): string {
    return tarotCardImage(cardId);
  }

  private shuffleDeck(): GridCard[] {
    const pool = [...TAROT_CARDS];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.map((card) => ({
      cardId: card.id,
      orientation: Math.random() > 0.5 ? 'REVERSED' : 'UPRIGHT',
      picked: 0,
    }));
  }
}
