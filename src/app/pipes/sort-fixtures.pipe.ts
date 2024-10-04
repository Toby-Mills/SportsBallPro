import { Pipe, PipeTransform } from '@angular/core';
import { Fixture } from '../models/fixture';

@Pipe({
  name: 'sortFixtures',
  standalone: true
})
export class SortFixturesPipe implements PipeTransform {

  transform(fixtures: Fixture[]): Fixture[] {

    return fixtures.sort((a, b) => new Date(b.datePlayed).getTime() - new Date (a.datePlayed).getTime())
  }

}