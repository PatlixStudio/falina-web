import { Injectable, signal } from '@angular/core';
import {
  AstrologyFocus,
  ReadingType,
  type CoffeeVisionResult,
  type SelectedTarotCard,
} from '@falina/shared';

/** A partially-configured reading, carried from the selection pages forward. */
export interface ReadingDraft {
  type: ReadingType;
  intent?: string;
  spreadCode?: string;
  symbols?: string[];
  focus?: AstrologyFocus;
  birth?: {
    birthDate: string;
    birthTime: string | null;
    birthLocation: string | null;
  };
  cards?: SelectedTarotCard[];
  /** Compressed coffee-cup photo as a data URL (coffee readings). */
  imageDataUrl?: string;
  /** Vision output from POST /readings/coffee/analyze, when image-driven. */
  vision?: CoffeeVisionResult;
}

@Injectable({ providedIn: 'root' })
export class ReadingDraftService {
  readonly draft = signal<ReadingDraft | null>(null);

  set(draft: ReadingDraft): void {
    this.draft.set(draft);
  }

  clear(): void {
    this.draft.set(null);
  }
}
