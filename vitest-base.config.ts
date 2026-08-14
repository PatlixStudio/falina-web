import { defineConfig } from 'vitest/config';

/**
 * Base Vitest config merged by the @angular/build:unit-test runner.
 * Ionic ships ESM that Node cannot directory-resolve when externalized, so the
 * Ionic packages must be inlined through the Vite pipeline.
 */
export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['@ionic/angular', '@ionic/core'],
      },
    },
  },
});
