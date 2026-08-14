import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import {
  COFFEE_INTENTS,
  COFFEE_SYMBOLS,
  CoffeeIntent,
  type CoffeeAnalyzeResult,
  type CoffeeObservation,
  type CoffeeVisionResult,
} from '@falina/shared';
import { ReadingDraftService } from '../../../core/reading-draft.service';
import { ReadingsService } from '../../../core/readings.service';
import { humanizeCode } from '../format';

const MAX_SYMBOLS = 3;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

type AnalyzeState = 'idle' | 'uploading' | 'analyzing' | 'done' | 'failed';

@Component({
  selector: 'falina-coffee-selection',
  standalone: true,
  imports: [RouterLink, IonContent],
  templateUrl: './coffee-selection.component.html',
  styleUrls: ['./coffee-selection.component.scss'],
})
export class CoffeeSelectionComponent {
  private readonly router = inject(Router);
  private readonly drafts = inject(ReadingDraftService);
  private readonly readings = inject(ReadingsService);

  readonly symbols = COFFEE_SYMBOLS;
  readonly intents = COFFEE_INTENTS;
  readonly maxSymbols = MAX_SYMBOLS;

  readonly selectedIntent = signal<CoffeeIntent | null>(null);
  readonly selectedSymbols = signal<string[]>([]);
  readonly imageDataUrl = signal<string | null>(null);
  readonly observations = signal<CoffeeObservation[]>([]);
  readonly visionResult = signal<CoffeeVisionResult | null>(null);
  readonly analyzeState = signal<AnalyzeState>('idle');
  readonly analyzeError = signal<string | null>(null);

  readonly humanize = humanizeCode;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.analyzeError.set('Please choose an image of your coffee cup.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this.analyzeError.set('That image is too large. Please choose one under 6 MB.');
      return;
    }
    this.analyzeError.set(null);
    this.analyzeState.set('uploading');
    void this.compressImage(file).then((dataUrl) => {
      this.imageDataUrl.set(dataUrl);
      void this.analyze(dataUrl);
    });
  }

  clearImage(): void {
    this.imageDataUrl.set(null);
    this.observations.set([]);
    this.visionResult.set(null);
    this.selectedSymbols.set([]);
    this.analyzeState.set('idle');
    this.analyzeError.set(null);
  }

  private async analyze(dataUrl: string): Promise<void> {
    this.analyzeState.set('analyzing');
    this.analyzeError.set(null);
    try {
      const result: CoffeeAnalyzeResult = await this.readings.analyzeCoffee(dataUrl);
      this.visionResult.set(result.vision);
      this.observations.set(result.vision?.observations ?? []);
      this.selectedSymbols.set(result.symbols.map((s) => s.code));
      this.analyzeState.set('done');
    } catch {
      // Vision unavailable → the reader can still pick symbols by hand below.
      this.analyzeState.set('failed');
      this.analyzeError.set(
        'We could not read the grounds automatically. Tap the symbols you see below instead.',
      );
    }
  }

  selectIntent(intent: CoffeeIntent): void {
    this.selectedIntent.set(intent);
  }

  toggleSymbol(code: string): void {
    this.selectedSymbols.update((current) => {
      if (current.includes(code)) {
        return current.filter((c) => c !== code);
      }
      if (current.length >= MAX_SYMBOLS) {
        return current;
      }
      return [...current, code];
    });
  }

  begin(): void {
    const intent = this.selectedIntent();
    const symbols = this.selectedSymbols();
    if (!intent || symbols.length === 0) {
      return;
    }
    this.drafts.set({
      type: 'COFFEE',
      intent,
      symbols,
      ...(this.imageDataUrl() ? { imageDataUrl: this.imageDataUrl()! } : {}),
      ...(this.visionResult() ? { vision: this.visionResult()! } : {}),
    });
    void this.router.navigate(['/reading']);
  }

  /** Downscales the photo to ≤1024px JPEG so uploads stay light. */
  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const max = 1024;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read that image.'));
      };
      img.src = url;
    });
  }
}
