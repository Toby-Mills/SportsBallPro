import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WatchListService } from '../../services/watch-list.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  private lastScrollTop = 0;
  isScrollingUp = false;
  private highlightTimeout: any = null;
  showCallout = false;
  area: 'wynberg' | 'main' = 'main';

  constructor(
    private watchListService: WatchListService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Get area from route data
    this.route.data.subscribe(data => {
      this.area = data['area'] || 'main';
    });

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
    // Only show callout on the matches route when there are no watched matches
    this.showCallout = url.includes('/matches') && this.watchListService.getWatchList(this.area).length === 0;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollingUp = scrollTop < this.lastScrollTop && scrollTop > 100;
    
    if (scrollingUp && !this.isScrollingUp) {
      this.isScrollingUp = true;
      
      // Clear any existing timeout
      if (this.highlightTimeout) {
        clearTimeout(this.highlightTimeout);
      }
      
      // Remove highlight after 1 second
      this.highlightTimeout = setTimeout(() => {
        this.isScrollingUp = false;
      }, 1000);
    }
    
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}
