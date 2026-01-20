import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDataset, RunComparison, RunComparisonChartData } from '../../models/run-comparison';
import { Color } from 'chart.js';
import { MatchService } from '../../services/match.service';

@Component({
    selector: 'app-run-comparison',
    imports: [
        CommonModule,
        BaseChartDirective,
    ],
    styleUrl: './run-comparison.component.css',
    templateUrl: './run-comparison.component.html',
    standalone: true
})
export class RunComparisonComponent {
  @Input() gameId: string = '';
  public chartData: RunComparisonChartData = new RunComparisonChartData()
  private teamAColour: Color = '#990000';
  private teamBColour: Color = '#000099'

  constructor(public matchService: MatchService) { }

  ngOnInit() {
    this.matchService.getRunComparisonUpdates(this.gameId).subscribe(
      runComparison => {
        this.chartData = runComparison.createChartData();

        this.chartOptions.scales.y.max = (Math.floor((this.chartData.maxRuns + 25) / 20)) * 20
        this.chartOptions.scales.x.max = this.chartData.maxOvers + 10;
        if (this.chartData.labels.length % 2 === 0) {
          this.chartData.labels.push((this.chartData.maxOvers + 1).toString());
        }
        for (let dataset of this.chartData.datasets) {
          if (dataset.label?.includes(this.chartData.teamAName)) {
            dataset.borderColor = this.teamAColour;
            dataset.pointBackgroundColor = this.teamAColour;
          } else {
            dataset.borderColor = this.teamBColour
            dataset.pointBackgroundColor = this.teamBColour;
          }
          dataset.borderWidth = 1;
          dataset.fill = true;
        }
        let maxRunsDataset = new ChartDataset()
        maxRunsDataset.label = 'target';
        maxRunsDataset.data.push({ x: '0', y: this.chartData.maxRuns });
        maxRunsDataset.data.push({ x: this.chartData.maxOvers.toString(), y: this.chartData.maxRuns });
        maxRunsDataset.borderColor = 'grey';
        if (this.chartData.maxRunsTeam == 'A') { maxRunsDataset.borderColor = this.teamAColour }
        else { maxRunsDataset.borderColor = this.teamBColour }
        maxRunsDataset.elements = { point: { radius: 0 }, line: { borderDash: [4, 6] } }; // Hide point elements
        this.chartData.datasets.push(maxRunsDataset);
      }
    )
  }

  public chartOptions = {
    responsive: true,
    animation: {duration: 0},
    maintainAspectRatio: false,
  
    plugins: {
      title: {
        display: true,
        text: 'Run Comparison'
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { filter: (legendItem: { text: string }) => (!(legendItem.text.includes('wicket') || legendItem.text.includes('target'))) } // do not show any legend entry for the 'wickets' scatterplot
      }
    },
    scales: {
      x: { beginAtZero: true, max: 20 },
      y: { beginAtZero: true, max: 100 },
    },
  };
}


