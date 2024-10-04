import { Pipe, PipeTransform } from '@angular/core';
import { Fixture } from '../models/fixture';

@Pipe({
  name: 'opponentTeam',
  standalone: true
})
export class OpponentTeamPipe implements PipeTransform {

  transform(fixture: Fixture, club: string): string {
    if (!fixture || !club) {
      return ''; // Handle missing input gracefully
    }

    const teams = fixture.game.split(' vs ');
    const opponent = teams.find(team => !team.toLowerCase().includes(club.toLowerCase()));

    return opponent || '';
  }

}
