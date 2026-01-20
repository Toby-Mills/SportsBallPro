import { Routes } from '@angular/router';
import { FixturesComponent } from './components/fixtures/fixtures.component';
import { MatchDetailsComponent } from './components/match-details/match-details.component';
import { MatchRedirectComponent } from './components/match-redirect/match-redirect.component';
import { ClubFixturesComponent } from './components/club-fixtures/club-fixtures.component';
import { StatsContainerComponent } from './components/stats-container/stats-container.component';
import { WynbergStatsContainerComponent } from './components/wynberg-stats-container/wynberg-stats-container.component';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
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
        component: AppLayoutComponent,
        data: { area: 'wynberg' },
        children: [
            { path: '', redirectTo: 'matches', pathMatch: 'full' },
            { 
                path: 'fixtures', 
                component: ClubFixturesComponent,
                data: {
                    clubName: 'Wynberg BHS',
                    logoUrl: 'https://www.websports.co.za/images/logos/small_wynberg.png',
                    title: 'Wynberg BHS Cricket Matches'
                }
            },
            { path: 'stats', component: WynbergStatsContainerComponent },
            { path: 'matches', component: MatchListComponent },
            { path: 'match/:id', component: MatchRedirectComponent }
        ]
    },
    {
        path: 'main',
        component: AppLayoutComponent,
        data: { area: 'main' },
        children: [
            { path: '', redirectTo: 'matches', pathMatch: 'full' },
            { path: 'fixtures', component: FixturesComponent },
            { path: 'stats', component: StatsContainerComponent },
            { path: 'matches', component: MatchListComponent },
            { path: 'match/:id', component: MatchRedirectComponent }
        ]
    },
    {
        path: 'rondebosch',
        component: AppLayoutComponent,
        data: { area: 'rondebosch' },
        children: [
            { path: '', redirectTo: 'matches', pathMatch: 'full' },
            { 
                path: 'fixtures', 
                component: ClubFixturesComponent,
                data: {
                    clubName: 'Rondebosch',
                    logoUrl: 'https://www.websports.co.za/images/logos/small_rondebosch_high.png',
                    title: 'Rondebosch BHS Cricket Matches'
                }
            },
            { path: 'matches', component: MatchListComponent },
            { path: 'match/:id', component: MatchRedirectComponent }
        ]
    },
];

