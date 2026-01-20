import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToasterComponent } from './toaster/toaster.component';


@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        FormsModule,
        ToasterComponent
    ],
    providers: [HttpClient,],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true
})
export class AppComponent {

  title = 'SportsBallPro';

  constructor() { }

}