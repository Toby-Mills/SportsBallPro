import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WagonWheel } from '../models/web-sports';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-wagon-wheel',
  standalone: true,
  imports: [],
  templateUrl: './wagon-wheel.component.html',
  styleUrl: './wagon-wheel.component.css'
})
export class WagonWheelComponent {
  public wagonWheelData: WagonWheel = new WagonWheel();
  public svgContent: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer, private matchService: MatchService) { }

  ngOnInit(){
    this.matchService.wagonWheelUpdated.subscribe(
      wagonWheel => {
        this.wagonWheelData = wagonWheel;
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(this.generateCricketFieldSvg(3));
      }
    )
  }

  generateCricketFieldSvg(scale: number): string {
    const fieldRadius = (50 - 0.5) * scale;
    const fieldDiameter = fieldRadius * 2;
    const svgWidth = fieldDiameter + (30 * scale); // Add space for the legend
    const svgHeight = fieldDiameter;
    const batterPosition = { x: fieldRadius, y: 45 * scale };
    const pitchDimensions = { width: 5 * scale, length: 20 * scale };
    const legendX = fieldDiameter + (10 * scale);
    const legendY = fieldRadius - (20 * scale);
    const legendSpacing = 10 * scale;
    const legendRadius = 4 * scale;
    const fontSize = 3 * scale;

    // Start building the SVG
    let svgContent = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">\n`;

    // Draw the circular field
    svgContent += this.drawField(fieldRadius, fieldDiameter);

    // Draw the pitch
    svgContent += this.drawPitch(batterPosition, pitchDimensions, fieldRadius);

    // Draw the wagon wheel lines
    svgContent += this.drawWagonWheelLines(scale, batterPosition);

    // Draw the batter
    svgContent += this.drawBatter(batterPosition, scale);

    // Add legend
    svgContent += this.drawLegend(scale, legendX, legendY, legendSpacing, legendRadius, fontSize);

    // Close the SVG
    svgContent += `</svg>`;

    return svgContent;
  }

  private drawField(fieldRadius: number, fieldDiameter: number): string {
    return `  <circle cx="${fieldDiameter / 2}" cy="${fieldDiameter / 2}" r="${fieldRadius}" fill="#98FB98" stroke="white" stroke-width="1" />\n`;
  }

  private drawPitch(batterPosition: { x: number; y: number }, pitchDimensions: { width: number; length: number }, fieldRadius: number): string {
    const pitchStartX = batterPosition.x - pitchDimensions.width / 2;
    const pitchStartY = fieldRadius - pitchDimensions.length / 2;
    return `  <rect x="${pitchStartX}" y="${pitchStartY}" width="${pitchDimensions.width}" height="${pitchDimensions.length}" fill="#D2B48C" />\n`;
  }

  private drawWagonWheelLines(scale: number, batterPosition: { x: number; y: number }): string {
    return this.wagonWheelData.wagonwheel
      .filter((shot) => shot.EventRuns > 0)
      .map((shot) => {
        const scaledRunX = shot.RunX * scale;
        const scaledRunY = shot.RunY * scale;
        const lineColor = this.getColorByRuns(shot.EventRuns);
        return `  <line x1="${batterPosition.x}" y1="${batterPosition.y}" x2="${scaledRunX}" y2="${scaledRunY}" stroke="${lineColor}" stroke-width="1" />\n`;
      })
      .join('');
  }

  private drawBatter(batterPosition: { x: number; y: number }, scale: number): string {
    return `  <circle cx="${batterPosition.x}" cy="${batterPosition.y}" r="${1 * scale}" fill="red" />\n`;
  }

  private drawLegend(
    scale: number,
    legendX: number,
    legendY: number,
    legendSpacing: number,
    legendRadius: number,
    fontSize: number
  ): string {
    const legendItems = [1, 2, 3, 4, 6];

    // Count the number of shots for each category
    const shotCounts: Record<number, number> = legendItems.reduce((counts, runs) => {
      counts[runs] = this.wagonWheelData.wagonwheel.filter((shot) => shot.EventRuns === runs).length;
      return counts;
    }, {} as Record<number, number>);

    return legendItems
      .map((run, index) => {
        const circleY = legendY + index * legendSpacing;
        const color = this.getColorByRuns(run);
        const shotCount = shotCounts[run] || 0;

        return (
          // Circle with number inside
          `  <circle cx="${legendX}" cy="${circleY}" r="${legendRadius}" fill="${color}" />\n` +
          `  <text x="${legendX}" y="${circleY}" font-size="${fontSize + 1}" fill="lightgray" text-anchor="middle" dominant-baseline="middle">${run}</text>\n` +
          // Shot count text to the right of the legend item
          `  <text x="${legendX + legendRadius + 2 * scale}" y="${circleY}" font-size="${fontSize}" fill="black" text-anchor="start" dominant-baseline="middle">${shotCount}</text>\n`
        );
      })
      .join('');
  }


  private getColorByRuns(runs: number): string {
    switch (runs) {
      case 1:
        return 'yellow';
      case 2:
        return 'blue';
      case 3:
        return 'purple';
      case 4:
        return 'black';
      case 6:
        return 'red';
      default:
        return 'gray';
    }
  }


}
