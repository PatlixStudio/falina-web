import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app';
import { appRoutes } from './app.routes';
import { AuthService } from './auth/auth.service';

/**
 * Boots the real app (AppComponent + real routes + real shell) and drives it
 * through the exact click paths a user takes: Home CTA -> Read -> pillar card.
 * Guards are bypassed by stubbing AuthService as authenticated. The clicks are
 * real DOM .click() events on the routerLink anchors — exactly what Angular
 * listens for in the browser.
 */
describe('App navigation (real routes)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideIonicAngular(),
        provideRouter(appRoutes),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            user: () => null,
            logout: () => {},
            restore: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  async function boot(): Promise<ComponentFixture<AppComponent>> {
    const fixture = TestBed.createComponent(AppComponent);
    await TestBed.inject(Router).navigate(['/']);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('Home "Choose a reading" click navigates to /read', async () => {
    const fixture = await boot();
    const cta = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.home__cta-button');
    expect(cta).toBeTruthy();
    expect(cta!.getAttribute('href')).toBe('/read');

    cta!.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/read');
    expect(fixture.nativeElement.textContent).toContain('What shall we read?');
  });

  it('Read pillar card click navigates to /coffee', async () => {
    const fixture = await boot();
    const router = TestBed.inject(Router);

    await router.navigate(['/read']);
    await fixture.whenStable();
    fixture.detectChanges();

    const outlet = (fixture.nativeElement as HTMLElement).querySelector('falina-read');
    expect(outlet).toBeTruthy();
    const card = outlet!.querySelector<HTMLElement>('.read__card[href="/coffee"]');
    expect(card).toBeTruthy();

    card!.click();
    await fixture.whenStable();

    expect(router.url).toBe('/coffee');
  });
});
