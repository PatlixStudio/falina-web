import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'falina-root',
  standalone: true,
  imports: [RouterOutlet],
  styles: [
    `
      @use 'theme/index' as theme;
      :host {
        display: block;
        min-height: 100vh;
      }
    `,
  ],
  template: `<router-outlet />`,
})
export class AppComponent {}
