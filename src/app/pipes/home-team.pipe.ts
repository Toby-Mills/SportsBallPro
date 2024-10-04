import { Pipe, PipeTransform } from '@angular/core';
import { Fixture } from '../models/fixture';

@Pipe({
  name: 'homeTeam',
  standalone: true
})
export class HomeTeamPipe implements PipeTransform {

  transform(fixture: Fixture, club: string): string {
    if (!fixture || !club) {
      return ''; // Handle missing input gracefully
    }

    const teams = fixture.game.split(' vs ');
    const homeTeam = teams.find(team => team.toLowerCase().includes(club.toLowerCase()));

    // Remove the club name from the home team name
    if (homeTeam) {
      const clubIndex = homeTeam.toLowerCase().indexOf(club.toLowerCase());
      return homeTeam.substring(0, clubIndex) + homeTeam.substring(clubIndex + club.length);
    }

    return '';
  }
}