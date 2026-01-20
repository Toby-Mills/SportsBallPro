import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WatchListService } from '../../services/watch-list.service';
import { MatchKeyService } from '../../services/match-key.service';
import { ToasterMessageService } from '../../services/toaster-message.service';

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
    private matchKeyService: MatchKeyService,
    private toasterMessage: ToasterMessageService
  ) {}

  ngOnInit(): void {
    const matchKey = this.route.snapshot.paramMap.get('id');
    const area = this.route.parent?.snapshot.data['area'] as 'wynberg' | 'main';

    if (matchKey && area) {
      // Decode the matchKey to get the actual gameId
      const gameId = this.matchKeyService.readKey(matchKey);
      console.log(`[MatchRedirectComponent] Decoded matchKey ${matchKey} to gameId ${gameId}`);
      
      // Add to watch list (will only add if not already present)
      const added = this.watchListService.addMatch(area, gameId);
      console.log(`[MatchRedirectComponent] Match added: ${added}, isWatching: ${this.watchListService.isWatching(area, gameId)}`);
      
      if (!added && !this.watchListService.isWatching(area, gameId)) {
        // Failed to add and not already watching - must be at limit
        this.toasterMessage.showMessage('Cannot add more than 10 matches to watch list', 'error');
      }
      
      // Redirect to matches view, passing gameId to scroll to
      console.log(`[MatchRedirectComponent] Navigating to matches with gameId: ${gameId}`);
      this.router.navigate([area, 'matches'], { state: { scrollToGameId: gameId } });
    }
  }
}
