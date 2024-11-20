import { Pipe, PipeTransform } from '@angular/core';
import { FixtureSummary } from '../models/fixture-summary';

@Pipe({
  name: 'sortFixtures',
  standalone: true
})
export class SortFixturesPipe implements PipeTransform {

  transform(fixtures: FixtureSummary[]): FixtureSummary[] {

    return fixtures.sort((a, b) => new Date(b.datePlayed).getTime() - new Date (a.datePlayed).getTime())
  }

}