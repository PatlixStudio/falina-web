import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ASTROLOGY_FOCUSES, AstrologyFocus } from '@falina/shared';
import { ReadingDraftService } from '../../../core/reading-draft.service';
import { humanizeCode } from '../format';

@Component({
  selector: 'falina-astrology-selection',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonContent],
  templateUrl: './astrology-selection.component.html',
  styleUrls: ['./astrology-selection.component.scss'],
})
export class AstrologySelectionComponent {
  private readonly router = inject(Router);
  private readonly drafts = inject(ReadingDraftService);

  readonly focuses = ASTROLOGY_FOCUSES;
  readonly selectedFocus = signal<AstrologyFocus>('ALL');

  readonly form = new FormGroup({
    birthDate: new FormControl('', [Validators.required]),
    birthTime: new FormControl(''),
    birthLocation: new FormControl('', [Validators.maxLength(120)]),
  });

  readonly humanize = humanizeCode;

  selectFocus(focus: AstrologyFocus): void {
    this.selectedFocus.set(focus);
  }

  begin(): void {
    if (this.form.invalid) {
      return;
    }
    const { birthDate, birthTime, birthLocation } = this.form.value as {
      birthDate: string;
      birthTime: string;
      birthLocation: string;
    };
    this.drafts.set({
      type: 'ASTROLOGY',
      focus: this.selectedFocus(),
      birth: {
        birthDate,
        birthTime: birthTime || null,
        birthLocation: birthLocation || null,
      },
    });
    void this.router.navigate(['/reading']);
  }
}
