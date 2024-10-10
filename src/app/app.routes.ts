import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'set-info/:gameId/:setId',
    loadComponent: () => import('./set-info/set-info.page').then(m => m.SetInfoPage)
  }
];
