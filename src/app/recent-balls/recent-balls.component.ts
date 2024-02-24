import { Component, Input } from '@angular/core';
import { Ball, Over, RecentBalls } from '../models/recent-balls';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-recent-balls',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './recent-balls.component.html',
  styleUrl: './recent-balls.component.css'
})
export class RecentBallsComponent {
  @Input() recentBalls: RecentBalls = new RecentBalls();
}