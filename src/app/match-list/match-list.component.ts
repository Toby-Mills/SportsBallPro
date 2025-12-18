import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { WatchListService } from '../services/watch-list.service';
import { MatchDetailsComponent } from '../match-details/match-details.component';
import { MatchKeyService } from '../services/match-key.service';
import { RefreshTimerComponent } from '../refresh-timer/refresh-timer.component';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, MatchDetailsComponent, RefreshTimerComponent],
  templateUrl: './match-list.component.html',
  styleUrl: './match-list.component.css'
})
export class MatchListComponent implements OnInit, OnDestroy, AfterViewInit {
  area: 'wynberg' | 'main' = 'main';
  watchedMatches: string[] = [];
  currentIndex = 0;
  isMobileView = false;
  useCarouselView = false; // True when we have too many matches for side-by-side
  private readonly MAX_SIDE_BY_SIDE = 3; // Maximum matches to show side-by-side
  currentScrollIndex = 0; // Which match is at the left edge
  visibleMatchCount = 2; // How many matches visible in carousel (responsive)
  private destroy$ = new Subject<void>();
  
  @ViewChild('refreshTimer') refreshTimer!: RefreshTimerComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private watchList: WatchListService,
    private matchKeyService: MatchKeyService,
    private matchService: MatchService
  ) {
    this.checkViewport();
  }

  ngOnInit() {
    // Detect area from parent route
    this.area = this.route.parent?.snapshot.data['area'] || 'main';
    
    console.log(`[MatchListComponent] Initialized for area: ${this.area}`);
    
    // Clean any invalid entries first
    this.watchList.cleanInvalidEntries(this.area);
    
    // Set initial visible match count
    this.updateVisibleMatchCount();
    
    // Load watch list
    this.refreshWatchList();
    
    // Refresh watch list whenever we navigate back to this component
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('[MatchListComponent] Navigation detected, refreshing watch list');
      this.refreshWatchList();
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  ngAfterViewInit() {
    // Initialize refresh timer if we have matches and timer is available
    if (this.watchedMatches.length > 0 && this.refreshTimer) {
      this.refreshTimer.setTimer(30000); // 30 seconds
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkViewport();
    this.updateVisibleMatchCount();
  }

  private checkViewport() {
    this.isMobileView = window.innerWidth < 768;
    this.updateViewMode();
  }

  private updateViewMode() {
    // Use carousel view if mobile OR if too many matches for side-by-side
    this.useCarouselView = this.isMobileView || this.watchedMatches.length > this.MAX_SIDE_BY_SIDE;
  }

  private refreshWatchList() {
    this.watchedMatches = this.watchList.getWatchList(this.area);
    console.log(`[MatchListComponent] Refreshed watch list for ${this.area}: ${this.watchedMatches.length} matches`, this.watchedMatches);
    
    // Update view mode based on number of matches
    this.updateViewMode();
    
    // Adjust current index if needed
    if (this.currentIndex >= this.watchedMatches.length && this.watchedMatches.length > 0) {
      this.currentIndex = this.watchedMatches.length - 1;
    }
    
    // Adjust scroll index if needed
    if (this.currentScrollIndex >= this.watchedMatches.length) {
      this.currentScrollIndex = Math.max(0, this.watchedMatches.length - this.visibleMatchCount);
    }
  }

  private updateVisibleMatchCount() {
    const width = window.innerWidth;
    if (width >= 1600) {
      this.visibleMatchCount = 3; // Large desktop: show 3
    } else if (width >= 1200) {
      this.visibleMatchCount = 2; // Medium desktop: show 2
    } else if (width >= 768) {
      this.visibleMatchCount = 2; // Tablet: show 2
    } else {
      this.visibleMatchCount = 1; // Mobile: show 1
    }
  }

  get canScrollLeft(): boolean {
    return this.currentScrollIndex > 0;
  }

  get canScrollRight(): boolean {
    return this.currentScrollIndex + this.visibleMatchCount < this.watchedMatches.length;
  }

  scrollLeft() {
    if (this.canScrollLeft) {
      this.currentScrollIndex--;
    }
  }

  scrollRight() {
    if (this.canScrollRight) {
      this.currentScrollIndex++;
    }
  }

  scrollToMatch(index: number) {
    // Adjust scroll index to show the clicked match
    // If clicking a match that's already visible, don't move
    // Otherwise, scroll to show that match at the start
    if (index < this.currentScrollIndex) {
      this.currentScrollIndex = index;
    } else if (index >= this.currentScrollIndex + this.visibleMatchCount) {
      this.currentScrollIndex = Math.max(0, index - this.visibleMatchCount + 1);
    }
  }

  get visibleMatches(): string[] {
    return this.watchedMatches.slice(
      this.currentScrollIndex,
      this.currentScrollIndex + this.visibleMatchCount
    );
  }

  get totalPages(): number {
    return Math.ceil(this.watchedMatches.length / this.visibleMatchCount);
  }

  get currentPage(): number {
    return Math.floor(this.currentScrollIndex / this.visibleMatchCount) + 1;
  }

  openFixtureSelection() {
    // Navigate to fixtures page in same area
    this.router.navigate(['../', 'fixtures'], { relativeTo: this.route });
  }

  removeMatch(gameId: string) {
    this.watchList.removeMatch(this.area, gameId);
    this.refreshWatchList();
  }

  shareMatch(gameId: string) {
    // Generate the match key from the gameId
    const matchKey = this.matchKeyService.generateKey(gameId);
    const matchUrl = `${window.location.origin}/${this.area}/match/${matchKey}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(matchUrl).then(() => {
        console.log('Match link copied to clipboard');
        // TODO: Show toast notification
      }).catch(err => {
        console.error('Failed to copy link:', err);
      });
    } else {
      // Fallback for non-secure contexts
      console.log('Share link:', matchUrl);
    }
  }

  openFullScreen(gameId: string) {
    window.open(`/${this.area}/match/${gameId}`, '_blank');
  }
  
  public onRefreshTimer() {
    // Only refresh matches that are not complete
    const liveMatches = this.watchedMatches.filter(gameId => !this.matchService.isMatchComplete(gameId));
    
    console.log(`[MatchListComponent] Refreshing ${liveMatches.length} of ${this.watchedMatches.length} matches`);
    
    liveMatches.forEach(gameId => {
      this.matchService.reloadMatchData(gameId);
    });
  }

  previousMatch() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextMatch() {
    if (this.currentIndex < this.watchedMatches.length - 1) {
      this.currentIndex++;
    }
  }

  goToMatch(index: number) {
    this.currentIndex = index;
  }
}
