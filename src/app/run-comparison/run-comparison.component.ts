import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { RunComparison, RunComparisonChartData } from '../models/run-comparison';
import { Color } from 'chart.js';

@Component({
  selector: 'app-run-comparison',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
  ],
  styleUrl: './run-comparison.component.css',
  templateUrl: './run-comparison.component.html',
})
export class RunComparisonComponent implements OnChanges {
  @Input() runComparison: RunComparison = new RunComparison()
  public chartData: RunComparisonChartData = new RunComparisonChartData()
  private teamAColour: Color = '#990000';
  private teamBColour: Color = '#000099'

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['runComparison']) {
      this.chartData = this.runComparison.createChartData();

      this.lineChartOptions.scales.y.max = (Math.floor((this.chartData.maxRuns + 20) / 20)) * 20
      this.lineChartOptions.scales.x.max = this.chartData.maxOvers + 10;
      if (this.chartData.labels.length % 2 === 0) {
        this.chartData.labels.push((this.chartData.maxOvers + 1).toString());
      }
      for (let dataset of this.chartData.datasets){
        if (dataset.label?.includes(this.chartData.teamAName)){
          dataset.borderColor = this.teamAColour;
          dataset.pointBackgroundColor = this.teamAColour;
          dataset.borderWidth = 2;
          dataset.fill = true;
        } else {
          dataset.borderColor = this.teamBColour
          dataset.pointBackgroundColor = this.teamBColour;
          dataset.borderWidth = 2;
          dataset.fill = true;
        }
      }
    }
  }

  public lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      title: {
        display: true,
        text: 'Run Comparison'
      },
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { filter: (legendItem: { text: string }) => (!legendItem.text.startsWith('wicket')) } // do not show any legend entry for the 'wickets' scatterplot
      }
    },
    scales: {
      x: { beginAtZero: true, max: 20 },
      y: { beginAtZero: true, max: 100 },
    },
  };
}
