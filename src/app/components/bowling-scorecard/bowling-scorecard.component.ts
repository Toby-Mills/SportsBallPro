import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, Pipe, PipeTransform, OnChanges, SimpleChanges, OnDestroy, ViewChild } from '@angular/core';
import { BowlingScorecard, BowlingScorecardEntry } from '../../models/scorecard';
import { MatchService } from '../../services/match.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { WagonWheelComponent } from '../wagon-wheel/wagon-wheel.component';
import { PlayerLineup } from '../../models/batting-innings-detail';

@Pipe({
  name: 'visible',
  standalone: true,
})
export class VisibleBowlers implements PipeTransform {
  transform(bowlers: BowlingScorecardEntry[], allBowlers: boolean): BowlingScorecardEntry[] {
    return bowlers.filter(bowler => {
      return (allBowlers || (bowler.strikeBowler || bowler.nonStrikeBowler));
    })
  }
}

@Component({
  selector: 'app-bowling-scorecard',
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    VisibleBowlers,
    ModalDialogComponent,
    WagonWheelComponent,
  ],
  templateUrl: './bowling-scorecard.component.html',
  styleUrl: './bowling-scorecard.component.css'
})
export class BowlingScorecardComponent implements OnChanges, OnDestroy {
  @Input() inningsNumber: 1 | 2 = 1;
  @Input() teamNumber: 1 | 2 = 1;
  @Input() gameId: string = '';
  @ViewChild('wagonWheelModal') wagonWheelModal?: ModalDialogComponent;
  
  public scorecard: BowlingScorecard = new BowlingScorecard();
  public allBowlers: boolean = false;
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
    this.subscription = this.matchService.getBowlingScorecardUpdates(this.gameId, this.inningsNumber, this.teamNumber).subscribe(
      scorecard => {
        this.scorecard = scorecard;
      }
    );
    
    // Subscribe to bowling lineup to get PlayerID for bowlers (who may not have batted)
    this.lineupSubscription?.unsubscribe();
    this.lineupSubscription = this.matchService.getBowlingLineupUpdates(this.gameId, this.inningsNumber, this.teamNumber).subscribe(
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
      this.matchService.loadWagonWheel(this.gameId, String(player.playerId), this.inningsNumber, this.teamNumber, 'bowling');
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