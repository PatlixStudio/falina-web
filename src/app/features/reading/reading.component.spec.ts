import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { vi } from 'vitest';
import { Reading } from '@falina/shared';
import { ReadingComponent } from './reading.component';
import { ReadingsService } from '../../core/readings.service';
import { ReadingDraftService } from '../../core/reading-draft.service';

const fixtureReading: Reading = {
  id: 'r1',
  userId: 'u1',
  type: 'TAROT',
  status: 'COMPLETED',
  title: 'Three Past Present Future · LOVE',
  summary: 'Eight of Swords · Ace of Cups · Three of Wands',
  content: {
    narrative: 'The pattern forms slowly.',
    sections: [{ heading: 'Past — Eight of Swords', body: 'In the past position.' }],
  },
  metadata: {
    intent: 'LOVE',
    spreadCode: 'three-past-present-future',
    spreadName: 'Three Past Present Future',
    cards: [
      {
        positionKey: 'past',
        label: 'Past',
        order: 1,
        orientation: 'UPRIGHT',
        cardId: 'minor-swords-08',
        cardName: 'Eight of Swords',
        arcana: 'MINOR',
        suit: 'SWORDS',
      },
    ],
  },
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ReadingComponent', () => {
  const create = vi.fn<typeof ReadingsService.prototype.create>();
  const get = vi.fn<typeof ReadingsService.prototype.get>();

  beforeEach(async () => {
    create.mockReset();
    get.mockReset();
    await TestBed.configureTestingModule({
      imports: [ReadingComponent],
      providers: [
        provideIonicAngular(),
        provideRouter([
          { path: 'reading', component: ReadingComponent },
          { path: 'reading/:id', component: ReadingComponent },
        ]),
        {
          provide: ReadingsService,
          useValue: { create, get, list: vi.fn() },
        },
      ],
    }).compileComponents();
  });

  it('shows the empty state when no draft is set', () => {
    const fixture = TestBed.createComponent(ReadingComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nothing selected yet');
  });

  it('reveals a reading from a draft', async () => {
    create.mockResolvedValue(fixtureReading);
    const drafts = TestBed.inject(ReadingDraftService);
    drafts.set({ type: 'TAROT', intent: 'LOVE', spreadCode: 'three-past-present-future' });

    const fixture = TestBed.createComponent(ReadingComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button.reading__link--primary');
    expect(button).toBeTruthy();

    button.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(create).toHaveBeenCalled();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Three Past Present Future · LOVE');
    expect(text).toContain('The pattern forms slowly.');
    expect(text).toContain('Eight of Swords');
  });

  it('loads a saved reading by id', async () => {
    get.mockResolvedValue(fixtureReading);
    const fixture = TestBed.createComponent(ReadingComponent);
    fixture.componentInstance.viewId = 'r1';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(get).toHaveBeenCalledWith('r1');
    expect(fixture.nativeElement.textContent).toContain('Back to history');
  });
});
