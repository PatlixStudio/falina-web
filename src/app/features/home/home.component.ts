import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

interface Pillar {
  name: string;
  line: string;
}

/**
 * Home placeholder rendered by the Phase 1 shell. The full Home experience
 * (today's energy, reading cards, weekly insight) arrives in Phase 2.
 */
@Component({
  selector: 'falina-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly appName = environment.appName;
  readonly tagline = environment.tagline;

  readonly pillars: Pillar[] = [
    { name: 'Coffee', line: 'See the signs.' },
    { name: 'Tarot', line: 'Ask the cards.' },
    { name: 'Astrology', line: 'Read your sky.' },
  ];
}
