import { Routes } from '@angular/router';
import { MatchKeysComponent } from './match-keys/match-keys.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { FixturesWynbergComponent } from './fixtures-wynberg/fixtures-wynberg.component';
import { StatsContainerComponent } from './stats/stats-container/stats-container.component';
import { WynbergStatsContainerComponent } from './stats/wynberg-stats-container/wynberg-stats-container.component';
import { WynbergLayoutComponent } from './layouts/wynberg-layout/wynberg-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    { path: '', redirectTo: '/main', pathMatch: 'full' },
    {
        path: 'wynberg',
        component: WynbergLayoutComponent,
        data: { area: 'wynberg' },
        children: [
            { path: '', redirectTo: 'fixtures', pathMatch: 'full' },
            { path: 'fixtures', component: FixturesWynbergComponent },
            { path: 'stats', component: WynbergStatsContainerComponent },
            { path: 'match/:id', component: MatchDetailsComponent }
        ]
    },
    {
        path: 'main',
        component: MainLayoutComponent,
        data: { area: 'main' },
        children: [
            { path: '', redirectTo: 'match-keys', pathMatch: 'full' },
            { path: 'match-keys', component: MatchKeysComponent },
            { path: 'stats', component: StatsContainerComponent },
            { path: 'wynberg-fixtures', component: FixturesWynbergComponent },
            { path: 'wynberg-stats', component: WynbergStatsContainerComponent },
            { path: 'match/:id', component: MatchDetailsComponent }
        ]
    }
];

