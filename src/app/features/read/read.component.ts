import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

interface ReadingOption {
  name: string;
  line: string;
  route: string;
}

/**
 * "Read" tab — the entry point to the three reading modalities.
 */
@Component({
  selector: 'falina-read',
  standalone: true,
  imports: [RouterLink, IonContent],
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.scss'],
})
export class ReadComponent {
  readonly options: ReadingOption[] = [
    { name: 'Tarot', line: 'Ask the cards.', route: '/tarot' },
    { name: 'Coffee', line: 'Read the signs.', route: '/coffee' },
    { name: 'Astrology', line: 'See the stars.', route: '/astrology' },
  ];
}
