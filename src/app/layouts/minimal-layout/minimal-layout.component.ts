import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-minimal-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './minimal-layout.component.html',
  styleUrl: './minimal-layout.component.css'
})
export class MinimalLayoutComponent {
}
