import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { RunComparison, RunComparisonChartData } from '../models/run-comparison';

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

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['runComparison']) {
      this.chartData = this.runComparison.createChartData();
      
      this.lineChartOptions.scales.y.max = this.chartData.maxRuns + 20
    }
  }
  //public lineChartData = {
  //  labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  //  datasets: [
  //    {
  //      data: [6, 16, 21, 25, 32, 39, 45, 52, 54, 57, 70],
  //      label: 'Team A',
  //      fill: true,
  //      tension: 0.4,
  //      borderColor: 'rgba(192, 100, 100, 1)',
  //      backgroundColor: 'rgba(192, 100, 100, 0)',
  //    },
  //    {
  //      data: [4, 12, 18, 23, 31, 33, 51],
  //      label: 'Team B',
  //      fill: true,
  //      tension: 0.4,
  //      borderColor: 'rgba(75, 192, 192, 1)',
  //      backgroundColor: 'rgba(75, 192, 192, 0)',
  //    },
  //  ],
  //};

  public lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point:{
        radius: 0
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Run Comparison'
      },
      legend: {
        display: true,
        position: 'bottom' as const
      }
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: { beginAtZero: true, max: 100 },
    },
  };
}
