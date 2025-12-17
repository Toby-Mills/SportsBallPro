import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wynberg-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './wynberg-layout.component.html',
  styleUrl: './wynberg-layout.component.css'
})
export class WynbergLayoutComponent {
  isMenuOpen = false;
  private lastScrollTop = 0;
  isScrollingDown = false;

  @HostListener('window:scroll', [])
  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrollingDown = scrollTop > this.lastScrollTop && scrollTop > 100;
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
