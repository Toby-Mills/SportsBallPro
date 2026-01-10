import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WatchListService } from '../../services/watch-list.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-wynberg-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './wynberg-layout.component.html',
  styleUrl: './wynberg-layout.component.css'
})
export class WynbergLayoutComponent {
  private lastScrollTop = 0;
  isScrollingDown = false;
  showCallout = false;

  constructor(
    private watchListService: WatchListService,
    private router: Router
  ) {
    // Check if we should show callout when navigating to matches route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateCalloutVisibility(event.url);
    });

    // Update callout when watch list changes
    this.watchListService.watchListChanged.subscribe(() => {
      this.updateCalloutVisibility(this.router.url);
    });
  }

  ngOnInit() {
    this.updateCalloutVisibility(this.router.url);
  }

  private updateCalloutVisibility(url: string) {
    // Determine area from URL
    const area: 'wynberg' | 'main' = url.includes('/wynberg') ? 'wynberg' : 'main';
    // Only show callout on the matches route when there are no watched matches
    this.showCallout = url.includes('/matches') && this.watchListService.getWatchList(area).length === 0;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrollingDown = scrollTop > this.lastScrollTop && scrollTop > 100;
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}
