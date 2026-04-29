import { Pipe, PipeTransform } from '@angular/core';
import { FixtureSummary } from '../models/fixture-summary';

@Pipe({
  name: 'sortFixturesByTeam',
  standalone: true
})
export class SortFixturesByTeamPipe implements PipeTransform {
  private static callCount = 0;

  transform(fixtures: FixtureSummary[], club: string): FixtureSummary[] {
    const start = performance.now();
    SortFixturesByTeamPipe.callCount++;

    const sorted = fixtures.sort((a, b) => {
      let fixtures = [a, b];
      let teams = ['',''];
      fixtures.forEach((fixture, index) => {
        if(fixture.teamAName.toLowerCase().includes(club.toLowerCase())){
          teams[index] = fixture.teamAName
        } else [
          teams[index] = fixture.teamBName
        ]
      })
      return (teams[0] > teams[1] ? 1 : -1)
    })

    if (SortFixturesByTeamPipe.callCount <= 20 || SortFixturesByTeamPipe.callCount % 250 === 0) {
      console.debug('[SortFixturesByTeamPipe] transform', {
        call: SortFixturesByTeamPipe.callCount,
        inputCount: fixtures?.length ?? 0,
        club,
        durationMs: Math.round(performance.now() - start)
      });
    }

    return sorted;


  }

}
