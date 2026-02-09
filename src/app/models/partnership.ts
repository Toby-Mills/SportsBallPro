export class Partnership {
  batter1Id: string = '';   // Batter who started first
  batter1Name: string = '';
  batter2Id: string = '';
  batter2Name: string = '';
  runs: number = 0;
  wicketNumber: number = 0; // 0 for opening, 1 for 1st wicket partnership, etc.
  isActive: boolean = false; // Currently in progress
  startTeamRuns: number = 0; // Team total when partnership started
  endTeamRuns?: number; // Team total when partnership ended (if ended)

  clone(): Partnership {
    const copy = new Partnership();
    copy.batter1Id = this.batter1Id;
    copy.batter1Name = this.batter1Name;
    copy.batter2Id = this.batter2Id;
    copy.batter2Name = this.batter2Name;
    copy.runs = this.runs;
    copy.wicketNumber = this.wicketNumber;
    copy.isActive = this.isActive;
    copy.startTeamRuns = this.startTeamRuns;
    copy.endTeamRuns = this.endTeamRuns;
    return copy;
  }

  static cloneArray(partnerships: Partnership[]): Partnership[] {
    return partnerships.map(p => p.clone());
  }
}
