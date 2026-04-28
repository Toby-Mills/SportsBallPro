import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uniqueGameIdsCount',
  standalone: true
})
export class UniqueGameIdsCountPipe implements PipeTransform {
  transform(gameTeamPairs: Array<{ gameId: string }>): number {
    if (!gameTeamPairs) return 0;
    const uniqueGameIds = new Set(gameTeamPairs.map(pair => pair.gameId));
    return uniqueGameIds.size;
  }
}
