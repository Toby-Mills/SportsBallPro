import { Routes } from '@angular/router';
import { FixturesComponent } from './fixtures/fixtures.component';
import { MatchDetailsComponent } from './match-details/match-details.component';
import { MatchRedirectComponent } from './match-redirect/match-redirect.component';
import { FixturesWynbergComponent } from './fixtures-wynberg/fixtures-wynberg.component';
import { StatsContainerComponent } from './stats/stats-container/stats-container.component';
import { WynbergStatsContainerComponent } from './stats/wynberg-stats-container/wynberg-stats-container.component';
import { WynbergLayoutComponent } from './layouts/wynberg-layout/wynberg-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { MatchListComponent } from './match-list/match-list.component';

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
            { path: 'matches', component: MatchListComponent },
            { path: 'match/:id', component: MatchRedirectComponent }
        ]
    },
    {
        path: 'main',
        component: MainLayoutComponent,
        data: { area: 'main' },
        children: [
            { path: '', redirectTo: 'fixtures', pathMatch: 'full' },
            { path: 'fixtures', component: FixturesComponent },
            { path: 'stats', component: StatsContainerComponent },
            { path: 'matches', component: MatchListComponent },
            { path: 'match/:id', component: MatchRedirectComponent }
        ]
    }
];

