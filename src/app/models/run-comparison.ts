import {RunComparison as WebSportsRunComparison} from '../models/web-sports';

export class RunComparison {
	comparison: Array<RunComparisonOver> = []

		public loadRunComparison(input: WebSportsRunComparison){
		for (let inputOver of input.comparison){
			let newOver = new RunComparisonOver;
			
			newOver.cumulativeRuns = inputOver.teamTotalRuns;
			newOver.gameId = inputOver.gameID;
			newOver.over = inputOver.over;
			newOver.runsInOver = inputOver.runsInOver;
			newOver.teamName = inputOver.team;
			newOver.wicketsInOver = inputOver.totalWicketsInOver;
			
			this.comparison.push(newOver);
		}
	}
}

export class RunComparisonOver {
	gameId: string = ''
	over:number = 0
	teamName: string = ''
	runsInOver: number = 0
	cumulativeRuns: number = 0
	wicketsInOver: number = 0
}