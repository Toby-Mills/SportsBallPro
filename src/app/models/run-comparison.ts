import TypedRegistry from 'chart.js/dist/core/core.typedRegistry';
import { RunComparisonAPI as WebSportsRunComparison } from '../models/web-sports';
import { Color } from 'chart.js';

export class RunComparisonFactory {
	public loadFromAPI(input: WebSportsRunComparison) {

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

export class RunComparison {
	comparison: Array<RunComparisonOver> = []

	public createChartData(): RunComparisonChartData {
		let chartData = new RunComparisonChartData();
		let lineDatasets: Array<ChartDataset> = [];
		let pointDatasets: Array<ChartDataset> = [];

		for (let over of this.comparison) {
			let teamName = over.teamName;

			//set the team names (to allow for consistent colors in legend)
			if (chartData.teamAName == '') {
				chartData.teamAName = teamName
			} else if (chartData.teamAName != teamName && chartData.teamBName == '') {
				chartData.teamBName = teamName
			}

			// Find or create the runs dataset for the team
			let lineDataset = lineDatasets.find(ds => ds.label === teamName);
			if (!lineDataset) {
				lineDataset = new ChartDataset
				lineDataset.type = 'line'
				lineDataset.label = teamName;
				lineDataset.elements = { point: { radius: 0 } }; // Hide point elements
				lineDataset.data.push(0);
				lineDatasets.push(lineDataset);
			}
			// Populate the specific over's runs data
			lineDataset.data[over.overNumber] = over.cumulativeRuns;

			//Update the maxRuns values
			if (over.overNumber > chartData.maxOvers) { chartData.maxOvers = over.overNumber }
			if (over.cumulativeRuns > chartData.maxRuns) {
				chartData.maxRuns = over.cumulativeRuns;
				if (over.teamName == chartData.teamAName) { chartData.maxRunsTeam = 'A' } else { chartData.maxRunsTeam = 'B' };
			}
		}

		// adding the wickets is done in a second loop, as it requires the maxRuns to already be determined
		for (let over of this.comparison) {
			let teamName = over.teamName;

			// Find or create the wickets dataset for the team
			let pointDataset = pointDatasets.find(ds => ds.label === `wickets: ${teamName}`);
			if (!pointDataset) {
				pointDataset = new ChartDataset
				pointDataset.type = 'scatter'
				pointDataset.label = `wickets: ${teamName}`;
				pointDataset.showLegend = false;
				pointDataset.data.push({ x: '-1', y: -1 }) //fake data point to make wicket numbers match array index
				pointDatasets.push(pointDataset);
			}
			// Populate the specific over's wickets data
			if (over.wicketsInOver > 0) {
				for (let wicket = 0; wicket < over.wicketsInOver; wicket++) {
					// use the runs to ensure the plots is on the runs line. Add an offset for each additional wicket in the over
					pointDataset.data.push({ x: over.overNumber.toString(), y: over.cumulativeRuns + (wicket * (chartData.maxRuns / 20)) });
				}
			}
		}


		// Generate an array of numbers from 0 to the max number of overs (for the x axis)
		chartData.labels = Array.from({ length: chartData.maxOvers + 1 }, (_, index) => (index).toString());

		chartData.datasets.push(...lineDatasets);
		chartData.datasets.push(...pointDatasets);

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
	teamAName: string = ''
	teamBName: string = ''
	datasets: Array<ChartDataset> = []
	labels: Array<string> = []
	maxOvers: number = 0
	maxRuns: number = 0
	maxRunsTeam: 'A' | 'B' = 'A'
}

export class ChartDataset {
	type: 'radar' | 'line' | 'bar' | 'scatter' | undefined
	label: string | undefined = ''
	data: Array<number | { x: string, y: number }> = []
	tension: number = 0.1
	fill: boolean = false
	showLegend: boolean = true
	elements = {}
	borderColor?: Color
	pointBackgroundColor?: Color
	pointBorderColor?: Color
	borderWidth: number = 1
}