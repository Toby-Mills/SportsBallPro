import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WatchListService } from '../../services/watch-list.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isMenuOpen = false;
  private lastScrollTop = 0;
  isScrollingDown = false;
  showCallout = false;
  private openedByHover = false;
  private closeTimeout: any = null;

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.popup-menu');
    
    // Close menu if click is outside both hamburger and menu
    if (this.isMenuOpen && 
        hamburger && !hamburger.contains(target) && 
        menu && !menu.contains(target)) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.openedByHover = false; // Click opens/closes, not hover
  }

  openMenu() {
    this.cancelClose(); // Cancel any pending close
    if (!this.isMenuOpen) {
      this.openedByHover = true;
    }
    this.isMenuOpen = true;
  }

  scheduleClose() {
    // Give user 300ms to move from button to menu
    if (this.openedByHover) {
      this.closeTimeout = setTimeout(() => {
        this.isMenuOpen = false;
        this.openedByHover = false;
      }, 300);
    }
  }

  cancelClose() {
    // Cancel scheduled close when entering menu
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  forceCloseMenu() {
    // Force close (used for overlay click and menu item clicks)
    this.isMenuOpen = false;
    this.openedByHover = false;
  }
}
