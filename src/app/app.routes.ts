import { Routes } from '@angular/router';
import { MatchKeysComponent } from './match-keys/match-keys.component';
import { HomeComponent } from '../app/home/home.component';
import { FixturesWynbergComponent } from './fixtures-wynberg/fixtures-wynberg.component';
import { StatsContainerComponent } from './stats/stats-container/stats-container.component';
import { WynbergStatsContainerComponent } from './stats/wynberg-stats-container/wynberg-stats-container.component';

export const routes: Routes = [
    { path: '', component: HomeComponent }, 
    { path: 'match-keys', component: MatchKeysComponent },
    { path: 'match/:id', component: HomeComponent },
    { path: 'wynberg', component: FixturesWynbergComponent },
    { path: 'stats', component: StatsContainerComponent },
    { path: 'wynbergbhsstats', component: WynbergStatsContainerComponent },
];

