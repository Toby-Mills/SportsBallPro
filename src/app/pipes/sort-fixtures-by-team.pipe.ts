import { Pipe, PipeTransform } from '@angular/core';
import { Fixture } from '../models/fixture';

@Pipe({
  name: 'sortFixturesByTeam',
  standalone: true
})
export class SortFixturesByTeamPipe implements PipeTransform {

  transform(fixtures: Fixture[], club: string): Fixture[] {

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
