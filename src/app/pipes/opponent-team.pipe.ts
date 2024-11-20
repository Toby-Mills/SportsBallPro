import { Pipe, PipeTransform } from '@angular/core';
import { FixtureSummary } from '../models/fixture-summary';

@Pipe({
  name: 'opponentTeam',
  standalone: true
})
export class OpponentTeamPipe implements PipeTransform {

  transform(fixture: FixtureSummary, club: string): string {
    if (!fixture || !club) {
      return ''; // Handle missing input gracefully
    }

    const teams = fixture.game.split(' vs ');
    const opponent = teams.find(team => !team.toLowerCase().includes(club.toLowerCase()));

    return opponent || '';
  }

}
