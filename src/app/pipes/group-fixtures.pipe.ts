import { Pipe, PipeTransform } from '@angular/core';
import { FixtureSummary } from '../models/fixture-summary';

@Pipe({
  name: 'groupFixtures',
  standalone: true
})
export class GroupFixturesPipe implements PipeTransform {

  transform(fixtures: any[], dateKey: string): any[] {
    const grouped = fixtures.reduce((acc, fixture) => {
      const date = fixture[dateKey];
      acc[date] = acc[date] || [];
      acc[date].push(fixture);
      return acc;
    }, {});

    return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      fixtures: grouped[date]
    }));
  }
}
