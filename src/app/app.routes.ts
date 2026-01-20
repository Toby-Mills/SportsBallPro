import { Routes } from '@angular/router';
import { FixturesComponent } from './components/fixtures/fixtures.component';
import { MatchDetailsComponent } from './components/match-details/match-details.component';
import { MatchRedirectComponent } from './components/match-redirect/match-redirect.component';
import { FixturesWynbergComponent } from './components/fixtures-wynberg/fixtures-wynberg.component';
import { StatsContainerComponent } from './components/stats-container/stats-container.component';
import { WynbergStatsContainerComponent } from './components/wynberg-stats-container/wynberg-stats-container.component';
import { WynbergLayoutComponent } from './layouts/wynberg-layout/wynberg-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { MinimalLayoutComponent } from './layouts/minimal-layout/minimal-layout.component';
import { MatchListComponent } from './components/match-list/match-list.component';

export const routes: Routes = [
    { path: '', redirectTo: '/wynberg', pathMatch: 'full' },
    {
        path: 'match/:id',
        component: MinimalLayoutComponent,
        children: [
            { path: '', component: MatchDetailsComponent }
        ]
    },
    {
        path: 'wynberg',
        component: WynbergLayoutComponent,
        data: { area: 'wynberg' },
        children: [
            { path: '', redirectTo: 'matches', pathMatch: 'full' },
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

