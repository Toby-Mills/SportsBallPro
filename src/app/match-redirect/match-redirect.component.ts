import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WatchListService } from '../services/watch-list.service';
import { MatchKeyService } from '../services/match-key.service';

@Component({
  selector: 'app-match-redirect',
  standalone: true,
  template: '<p>Loading match...</p>',
  styles: ['p { text-align: center; margin-top: 2em; }']
})
export class MatchRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private watchListService: WatchListService,
    private matchKeyService: MatchKeyService
  ) {}

  ngOnInit(): void {
    const matchKey = this.route.snapshot.paramMap.get('id');
    const area = this.route.parent?.snapshot.data['area'] as 'wynberg' | 'main';

    if (matchKey && area) {
      // Decode the matchKey to get the actual gameId
      const gameId = this.matchKeyService.readKey(matchKey);
      console.log(`[MatchRedirectComponent] Decoded matchKey ${matchKey} to gameId ${gameId}`);
      
      // Add to watch list (will only add if not already present)
      this.watchListService.addMatch(area, gameId);
      
      // Redirect to matches view using absolute path
      this.router.navigate([area, 'matches']);
    }
  }
}
