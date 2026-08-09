# falina-web

Falina — **Your Personal Oracle**. Angular 22 + Ionic + Capacitor mobile app
with a custom Falina design system.

Phase 1 (foundation): standalone Angular 22 app, centralized design tokens and
environment configuration. Ionic + Capacitor shell, navigation and the full
Home experience arrive in Phase 2.

## Stack

- Angular 22 (standalone components, signals-ready), SCSS
- Custom design system in `src/theme/` (tokens: colors, typography, spacing,
  radii, shadows, motion, z-index)
- `@falina/shared` (file dependency → `libs/falina-shared`)

## Quick start

```bash
npm install
npx nx serve falina-web        # http://localhost:4202
npx nx build falina-web
npx nx test falina-web
```

## Design system

`src/theme/_index.scss` is the single entry point. Components import it and use
semantic tokens only — never raw hex:

```scss
@use 'theme/index' as theme;
background: theme.$falina-color-background;
color: theme.$falina-color-accent;
```

## Environments

- `src/environments/environment.ts` (production, replaced by fileReplacements)
- `src/environments/environment.development.ts` (dev: API at :3002)
