import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookOutline, homeOutline, personOutline, timeOutline } from 'ionicons/icons';
import { TopBarComponent } from '../top-bar/top-bar.component';

addIcons({ homeOutline, bookOutline, timeOutline, personOutline });

/**
 * Mobile shell: brand top bar + bottom tab navigation (Home / Read / History /
 * Profile). Auth scenes (login/register) are routed OUTSIDE this shell so no
 * navigation chrome is visible there.
 */
@Component({
  selector: 'falina-app-shell',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    TopBarComponent,
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent {}
