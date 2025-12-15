import { Component, Input } from '@angular/core';
import { FallOfWickets } from '../models/fall-of-wickets';
import { CommonModule } from '@angular/common';
import { MatchService } from '../services/match.service';

@Component({
    selector: 'app-fall-of-wickets',
    imports: [CommonModule],
    templateUrl: './fall-of-wickets.component.html',
    styleUrl: './fall-of-wickets.component.css'
})
export class FallOfWicketsComponent {
@Input() innings: 1 | 2 = 1;
  @Input() gameId: string = '';
  public fallOfWickets:FallOfWickets = new FallOfWickets;

  constructor (public matchService: MatchService){}

  ngOnInit(){
    if(this.innings ==1){
      this.matchService.getInnings1FallOfWicketsUpdates(this.gameId).subscribe(
        fallOfWickets => {
          this.fallOfWickets = fallOfWickets;
        }
      )
    }else{
      this.matchService.getInnings2FallOfWicketsUpdates(this.gameId).subscribe(
        fallOfWickets => {
          this.fallOfWickets = fallOfWickets;
        }
      )
    }
  }
}
