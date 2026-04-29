import { Pipe, PipeTransform } from '@angular/core';
import { FixtureSummary } from '../models/fixture-summary';

@Pipe({
  name: 'groupFixtures',
  standalone: true
})
export class GroupFixturesPipe implements PipeTransform {
  private static callCount = 0;

  transform(fixtures: any[], dateKey: string): any[] {
    const start = performance.now();
    GroupFixturesPipe.callCount++;

    const grouped = fixtures.reduce((acc, fixture) => {
      const date = fixture[dateKey];
      acc[date] = acc[date] || [];
      acc[date].push(fixture);
      return acc;
    }, {});

    const result = Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        date,
        fixtures: grouped[date]
      }));

    if (GroupFixturesPipe.callCount <= 20 || GroupFixturesPipe.callCount % 250 === 0) {
      console.debug('[GroupFixturesPipe] transform', {
        call: GroupFixturesPipe.callCount,
        inputCount: fixtures?.length ?? 0,
        groups: result.length,
        durationMs: Math.round(performance.now() - start)
      });
    }

    return result;
  }
}
