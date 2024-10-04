import { Routes } from '@angular/router';
import { MatchKeysComponent } from './match-keys/match-keys.component';
import { HomeComponent } from '../app/home/home.component';
import { FixturesWynbergComponent } from './fixtures-wynberg/fixtures-wynberg.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, 
    { path: 'match-keys', component: MatchKeysComponent },
    { path: 'match/:id', component: HomeComponent },
    { path: 'wynberg', component: FixturesWynbergComponent },
];
