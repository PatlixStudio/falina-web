import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { AppShellComponent } from './core/app-shell/app-shell.component';
import { HomeComponent } from './features/home/home.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'read',
        loadComponent: () => import('./features/read/read.component').then((m) => m.ReadComponent),
      },
      {
        path: 'history',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/history/history.component').then((m) => m.HistoryComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'coffee',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/selection/coffee/coffee-selection.component').then(
            (m) => m.CoffeeSelectionComponent,
          ),
      },
      {
        path: 'tarot',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/selection/tarot/tarot-selection.component').then(
            (m) => m.TarotSelectionComponent,
          ),
      },
      {
        path: 'astrology',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/selection/astrology/astrology-selection.component').then(
            (m) => m.AstrologySelectionComponent,
          ),
      },
      {
        path: 'reading',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reading/reading.component').then((m) => m.ReadingComponent),
      },
      {
        path: 'reading/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reading/reading.component').then((m) => m.ReadingComponent),
      },
    ],
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  { path: '**', redirectTo: '' },
];
