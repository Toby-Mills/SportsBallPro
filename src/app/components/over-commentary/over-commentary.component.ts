import { Component, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { OverCommentary } from '../../models/ball-commentary';

@Component({
  selector: 'app-over-commentary',
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: './over-commentary.component.html',
  styleUrl: './over-commentary.component.css',
  standalone: true
})
export class OverCommentaryComponent {
  @Input() over: OverCommentary = new OverCommentary();
}
