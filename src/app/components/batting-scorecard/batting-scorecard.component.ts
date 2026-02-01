import { Component, Input, Pipe, PipeTransform, OnChanges, SimpleChanges, OnDestroy, ViewChild } from '@angular/core';
import { BattingScorecard, BattingScorecardEntry } from '../../models/scorecard';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../../services/match.service';
import { Subscription } from 'rxjs';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { WagonWheelComponent } from '../wagon-wheel/wagon-wheel.component';
import { PlayerLineup } from '../../models/match';


@Pipe({
  name: 'visible',
  standalone: true,
})
export class VisibleBatter implements PipeTransform {
  transform(batters: BattingScorecardEntry[], allBatters: boolean): BattingScorecardEntry[] {
    return batters.filter(batter => {
      switch (batter.howOutFull) {
        case '':
        case 'dnb': return false;
          break;
        case 'n/o': return true;
          break;
        default:
          return allBatters;
      }
    })
  }
}

@Component({
    selector: 'app-batting-scorecard',
    imports: [
        CommonModule,
        FormsModule,
        NgFor,
        VisibleBatter,
        ModalDialogComponent,
        WagonWheelComponent,
    ],
    templateUrl: './batting-scorecard.component.html',
    styleUrl: './batting-scorecard.component.css'
})
export class BattingScorecardComponent implements OnChanges, OnDestroy {
  @Input() inningsNumber: 1 | 2 = 1;
  @Input() teamNumber: 1 | 2 = 1;
  @Input() gameId: string = '';
  @ViewChild('wagonWheelModal') wagonWheelModal?: ModalDialogComponent;
  
  public scorecard: BattingScorecard = new BattingScorecard;
  public allBatters: boolean = false;
  public showWagonWheel: boolean = false;
  public selectedPlayerId: string = '';
  public selectedPlayerName: string = '';
  public lineup: PlayerLineup = new PlayerLineup();
  private subscription?: Subscription;
  private lineupSubscription?: Subscription;

  constructor(public matchService: MatchService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inningsNumber'] || changes['teamNumber'] || changes['gameId']) {
      this.subscribe();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.lineupSubscription?.unsubscribe();
  }

  private subscribe() {
    this.subscription?.unsubscribe();
    this.subscription = this.matchService.getBattingScorecardUpdates(this.gameId, this.inningsNumber, this.teamNumber).subscribe(
      scorecard => {
        this.scorecard = scorecard;
      }
    );
    
    // Subscribe to batting lineup to get PlayerID
    this.lineupSubscription?.unsubscribe();
    this.lineupSubscription = this.matchService.getBattingLineupUpdates(this.gameId, this.inningsNumber, this.teamNumber).subscribe(
      lineup => {
        this.lineup = lineup;
      }
    );
  }

  onPlayerClick(serverPlayerId: string, playerName: string): void {
    // Find the player in the lineup to get their PlayerID (not ServerPlayerID)
    const player = this.lineup.lineup.find(p => 
      `${p.firstName} ${p.surname}`.trim() === playerName.trim()
    );
    
    if (player && player.playerId) {
      this.selectedPlayerId = String(player.playerId);
      this.selectedPlayerName = playerName;
      this.matchService.loadWagonWheel(this.gameId, String(player.playerId), this.inningsNumber, this.teamNumber, 'batting');
      this.showWagonWheel = true;
    } else {
      console.warn('Player not found in lineup:', playerName);
    }
  }

  onCloseWagonWheel(): void {
    this.showWagonWheel = false;
    this.selectedPlayerId = '';
    this.selectedPlayerName = '';
  }
}

