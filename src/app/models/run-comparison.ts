import { RunComparison as WebSportsRunComparison } from '../models/web-sports';

export class RunComparisonFactory {
	public loadRunComparison(input: WebSportsRunComparison) {

		let newRunComparison = new RunComparison()

		for (let inputOver of input.comparison) {
			let newOver = new RunComparisonOver;

			newOver.cumulativeRuns = inputOver.teamTotalRuns;
			newOver.gameId = inputOver.gameID;
			newOver.overNumber = inputOver.over;
			newOver.runsInOver = inputOver.runsInOver;
			newOver.teamName = inputOver.team;
			newOver.wicketsInOver = inputOver.totalWicketsInOver;

			newRunComparison.comparison.push(newOver);
		}

		return newRunComparison;
	}
}

  //      data: [6, 16, 21, 25, 32, 39, 45, 52, 54, 57, 70],
  //      label: 'Team A',
  //      fill: true,
  //      tension: 0.4,
  //      borderColor: 'rgba(192, 100, 100, 1)',
  //      backgroundColor: 'rgba(192, 100, 100, 0)',
export class RunComparison {
	comparison: Array<RunComparisonOver> = []

	public createChartData(): RunComparisonChartData {
		let chartData = new RunComparisonChartData();
		let datasets: Array<ChartDataset> = [];

		for (let over of this.comparison) {
			let teamName = over.teamName;

			// Find or create the dataset for the team
			let dataset = datasets.find(ds => ds.label === teamName);
			if (!dataset) {
				dataset = new ChartDataset
				dataset = {
					label: teamName,
					data: [], // Initialize an empty array for the runs data
					tension: 0.1				};
				datasets.push(dataset);
			}

			// Populate the specific over's data (over.overNumber is zero-based index)
			dataset.data[over.overNumber - 1] = over.cumulativeRuns;

			if (over.overNumber > chartData.maxOvers){chartData.maxOvers = over.overNumber}
			if (over.cumulativeRuns > chartData.maxRuns){chartData.maxRuns = over.cumulativeRuns}

		}
		chartData.labels = Array.from({ length: chartData.maxOvers }, (_, i) => (i + 1).toString());
		chartData.datasets = datasets;

		return chartData;
	}

}

export class RunComparisonOver {
	gameId: string = ''
	overNumber: number = 0
	teamName: string = ''
	runsInOver: number = 0
	cumulativeRuns: number = 0
	wicketsInOver: number = 0
}

export class RunComparisonChartData {
	datasets: Array<ChartDataset> = []
	labels: Array<string> = []
	maxOvers: number = 0
	maxRuns: number = 0
}

export class ChartDataset {
	label: string = ''
	data: Array<number> = []
	tension?: number = 0
	fill?: boolean = false
	
}