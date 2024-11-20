import { Pipe, PipeTransform } from '@angular/core';
import { FixtureSummary } from '../models/fixture-summary';

@Pipe({
  name: 'sortFixturesByTeam',
  standalone: true
})
export class SortFixturesByTeamPipe implements PipeTransform {

  transform(fixtures: FixtureSummary[], club: string): FixtureSummary[] {

    return fixtures.sort((a, b) => {
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


  }

}
