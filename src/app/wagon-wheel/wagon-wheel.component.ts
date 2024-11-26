import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatchService } from '../services/match.service';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { CommonModule } from '@angular/common';
import { PlayerLineup } from '../models/match';
import { WagonWheel } from '../models/wagon-wheel';
import { WebSportsAPIService } from '../services/web-sports-api.service';

@Component({
  selector: 'app-wagon-wheel',
  standalone: true,
  imports: [ModalDialogComponent, CommonModule],
  templateUrl: './wagon-wheel.component.html',
  styleUrl: './wagon-wheel.component.css'
})
export class WagonWheelComponent {
  public teamAId: string = '';
  public teamAName: string = '';
  public teamALogoName: string = '';
  public teamBId: string = '';
  public teamBName: string = '';
  public teamBLogoName: string = '';
  public wagonWheelData: WagonWheel = new WagonWheel();
  public teamABattingLineup: PlayerLineup = new PlayerLineup();
  public teamBBattingLineup: PlayerLineup = new PlayerLineup();
  public teamABowlingLineup: PlayerLineup = new PlayerLineup();
  public teamBBowlingLineup: PlayerLineup = new PlayerLineup();
  public playerNumber: number = 0;
  public playerName: string = '';

  public svgContent: SafeHtml = '';

  public showPlayerSelector = false;
  public playerSelectorTeamId = '';
  public playerSelectorTeamName = '';
  public playerSelectorTeamLogoUrl = ''
  public playerSelectorType: 'Batting' | 'Bowling' = 'Batting';
  public playerSelectorTypeUrl = '';
  public playerSelectorLineup: PlayerLineup = new PlayerLineup();

  onClosePlayerSelector() {
    this.showPlayerSelector = false;
  }

  constructor(private sanitizer: DomSanitizer, private matchService: MatchService, private webSportsAPI: WebSportsAPIService) { }

  ngOnInit() {
    this.matchService.fixtureUpdated.subscribe(
      fixture => {
        this.teamAId = fixture.teamAId;
        this.teamAName = fixture.teamAName;
        this.teamALogoName = fixture.teamALogoName;
        if (this.playerSelectorTeamId == '') {
          this.playerSelectorTeamId = this.teamAId;
          this.playerSelectorTeamName = this.teamAName;
          this.playerSelectorTeamLogoUrl = this.webSportsAPI.teamSmallLogoUrl(this.teamALogoName, 1);
          this.playerSelectorType = 'Batting';
          this.playerSelectorTypeUrl = `assets/${this.playerSelectorType}.png`;

        };
        this.teamBId = fixture.teamBId;
        this.teamBName = fixture.teamBName;
        this.teamBLogoName = fixture.teamBLogoName;
      }
    )
    this.matchService.wagonWheelUpdated.subscribe(
      wagonWheel => {
        this.wagonWheelData = wagonWheel;
        let player = undefined;
        if (wagonWheel.type == 'Batting' && wagonWheel.teamId == this.teamAId) { player = this.teamABattingLineup.lineup.find(player => player.playerId == wagonWheel.playerId) }
        else if (wagonWheel.type == 'Batting' && wagonWheel.teamId == this.teamBId) { player = this.teamBBattingLineup.lineup.find(player => player.playerId == wagonWheel.playerId) }
        else if (wagonWheel.type == 'Bowling' && wagonWheel.teamId == this.teamAId) { player = this.teamABowlingLineup.lineup.find(player => player.playerId == wagonWheel.playerId) }
        else if (wagonWheel.type == 'Bowling' && wagonWheel.teamId == this.teamBId) { player = this.teamBBowlingLineup.lineup.find(player => player.playerId == wagonWheel.playerId) }
        if (player) {
          this.playerName = player.firstName + ' ' + player.surname;
          this.playerNumber = player.number;
        } else {
          this.playerName = 'choose a player...'
        }
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(this.generateCricketFieldSvg(3));
      }
    )
    this.matchService.teamABattingLineupUpdated.subscribe(
      battingLineup => {
        this.teamABattingLineup = battingLineup;
        this.loadPlayerSelectorLineup();
      }
    )
    this.matchService.teamBBattingLineupUpdated.subscribe(
      battingLineup => {
        this.teamBBattingLineup = battingLineup;
        this.loadPlayerSelectorLineup();
      }
    )
    this.matchService.teamABowlingLineupUpdated.subscribe(
      bowlingLineup => {
        this.teamABowlingLineup = bowlingLineup;
        this.loadPlayerSelectorLineup();
      }
    )
    this.matchService.teamBBowlingLineupUpdated.subscribe(
      bowlingLineup => {
        this.teamBBowlingLineup = bowlingLineup;
        this.loadPlayerSelectorLineup();
      }
    )

  }

  public onPlayerClick(playerId: number) {
    this.showPlayerSelector = false;
    this.matchService.setWagonWheelPlayer(this.playerSelectorTeamId, playerId, this.playerSelectorType);
  }

  generateCricketFieldSvg(scale: number): string {
    const fieldRadius = (50 - 0.5) * scale;
    const fieldDiameter = fieldRadius * 2;
    const svgWidth = fieldDiameter + (30 * scale); // Add space for the legend
    const svgHeight = fieldDiameter;
    const batterPosition = { x: fieldRadius, y: 42 * scale };
    const pitchDimensions = { width: 5 * scale, length: 20 * scale };
    const legendX = fieldDiameter + (10 * scale);
    const legendY = fieldRadius - (20 * scale);
    const legendSpacing = 10 * scale;
    const legendRadius = 4 * scale;
    const fontSize = 4 * scale;

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
    return `  <circle cx="${fieldDiameter / 2}" cy="${fieldDiameter / 2}" r="${fieldRadius}" fill="#cafcca" stroke="#60CB60" stroke-width="1" />\n`;

  }

  private drawPitch(batterPosition: { x: number; y: number }, pitchDimensions: { width: number; length: number }, fieldRadius: number): string {
    const pitchStartX = batterPosition.x - pitchDimensions.width / 2;
    const pitchStartY = fieldRadius - pitchDimensions.length / 2;
    return `  <rect x="${pitchStartX}" y="${pitchStartY}" width="${pitchDimensions.width}" height="${pitchDimensions.length}" fill="#D2B48C" />\n`;
  }

  private drawWagonWheelLines(scale: number, batterPosition: { x: number; y: number }): string {
    return this.wagonWheelData.events
      .filter((shot) => shot.runs > 0)
      .map((shot) => {
        const scaledRunX = shot.x * scale;
        const scaledRunY = shot.y * scale;
        let dashLength = 0;
        let dashGapLength = 0;
        let strokeWidth = 1;
        switch (shot.runs) {
          case 1:
          case 2:
          case 3: dashLength = shot.runs;
            dashGapLength = 5 - shot.runs;
            break;
          case 6:
            strokeWidth = 2;
        }
        const lineColor = this.getColorByRuns(shot.runs);
        return `  <line x1="${batterPosition.x}" y1="${batterPosition.y}" x2="${scaledRunX}" y2="${scaledRunY}" stroke="${lineColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dashLength}, ${dashGapLength}" />\n`;
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
    const legendItems = [1, 2, 3, 4, 5, 6];

    // Count the number of shots for each category
    const shotCounts: Record<number, number> = legendItems.reduce((counts, runs) => {
      counts[runs] = this.wagonWheelData.events.filter((shot) => shot.runs === runs).length;
      return counts;
    }, {} as Record<number, number>);

    return legendItems
      .map((run, index) => {
        const circleY = legendY + index * legendSpacing;
        const color = this.getColorByRuns(run);
        const shotCount = shotCounts[run] || 0;


        let legendItem: string = '';

        legendItem =
          // Circle with number inside
          `  <circle cx="${legendX}" cy="${circleY}" r="${legendRadius}" fill="${color}" />\n` +
          `  <text x="${legendX}" y="${circleY}" font-size="${fontSize + 1}" fill="lightgray" text-anchor="middle" dominant-baseline="middle">${run}</text>\n`;

        // Shot count text to the right of the legend item (if > 0)
        if (shotCount > 0) {
          legendItem = legendItem +
            `  <text x="${legendX + legendRadius + 2 * scale}" y="${circleY}" font-size="${fontSize}" fill="black" text-anchor="start" dominant-baseline="middle">${shotCount}</text>\n`
        }
        ;
        return legendItem;
      })
      .join('');
  }


  private getColorByRuns(runs: number): string {
    switch (runs) {
      case 1:
        return 'darkgreen';
      case 2:
        return 'blue';
      case 3:
        return 'purple';
      case 4:
        return 'black';
      case 5:
        return 'orange';
      case 6:
        return 'red';
      default:
        return 'gray';
    }
  }

  public onPlayerSelectorTypeClick() {
    if (this.playerSelectorType === 'Batting') { this.playerSelectorType = 'Bowling' } else { this.playerSelectorType = 'Batting' }
    this.playerSelectorTypeUrl = `assets/${this.playerSelectorType}.png`;
    this.loadPlayerSelectorLineup();
  }

  public onPlayerSelectorTeamClick() {
    if (this.playerSelectorTeamId == this.teamAId) {
      this.playerSelectorTeamId = this.teamBId;
      this.playerSelectorTeamName = this.teamBName;
      this.playerSelectorTeamLogoUrl = this.webSportsAPI.teamSmallLogoUrl(this.teamBLogoName, 2);
    } else {
      this.playerSelectorTeamId = this.teamAId
      this.playerSelectorTeamName = this.teamAName;
      this.playerSelectorTeamLogoUrl = this.webSportsAPI.teamSmallLogoUrl(this.teamALogoName, 1);
    }
    this.loadPlayerSelectorLineup();
  }

  private loadPlayerSelectorLineup() {
    if (this.playerSelectorTeamId == this.teamAId && this.playerSelectorType == 'Batting') { this.playerSelectorLineup = this.teamABattingLineup };
    if (this.playerSelectorTeamId == this.teamBId && this.playerSelectorType == 'Batting') { this.playerSelectorLineup = this.teamBBattingLineup };
    if (this.playerSelectorTeamId == this.teamAId && this.playerSelectorType == 'Bowling') { this.playerSelectorLineup = this.teamABowlingLineup };
    if (this.playerSelectorTeamId == this.teamBId && this.playerSelectorType == 'Bowling') { this.playerSelectorLineup = this.teamBBowlingLineup };
  }

  public onNextPlayerClick() {
    let index = this.playerSelectorLineup.lineup.findIndex(player => player.playerId == this.wagonWheelData.playerId);

    if ((index || 0) < this.playerSelectorLineup.lineup.length - 1) {
      index++;
    } else { index = 0 }

    let newPlayerId = this.playerSelectorLineup.lineup[index].playerId;

    this.onPlayerClick(newPlayerId);
  }

  public onPreviousPlayerClick() {
    let index = this.playerSelectorLineup.lineup.findIndex(player => player.playerId == this.wagonWheelData.playerId);

    if ((index || 0) > 0) {
      index--;
    } else { index = this.playerSelectorLineup.lineup.length - 1 }

    let newPlayerId = this.playerSelectorLineup.lineup[index].playerId;

    this.onPlayerClick(newPlayerId);
  }
}
