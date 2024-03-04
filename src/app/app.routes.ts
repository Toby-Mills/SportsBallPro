import { Routes } from '@angular/router';
import { MatchKeysComponent } from './match-keys/match-keys.component';
import { HomeComponent } from '../app/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, 
    { path: 'match-keys', component: MatchKeysComponent }
];
