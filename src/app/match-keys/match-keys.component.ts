import { APP_BASE_HREF, CommonModule, NgFor } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Fixtures } from '../models/fixture';
import { HttpClient } from '@angular/common/http';
import { MatchKeyService } from '../services/match-key.service'

@Component({
  selector: 'app-match-keys',
  standalone: true,
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
  imports: [
    CommonModule,
    NgFor,
  ],
  templateUrl: './match-keys.component.html',
  styleUrl: './match-keys.component.css'
})
export class MatchKeysComponent implements OnInit {
  public gameId: string = '';
  public key: string = '';
  public url: string = '';
  public fixtures: Fixtures = new Fixtures;

  constructor(
    private http: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string,
    private matchKey: MatchKeyService,
  ) { }

  ngOnInit() {
    this.loadFixtures();
  }

  public createKey(Id: string | null) {
    console.log(Id);
    if (Id) {
      this.gameId = Id;;
      this.key = this.matchKey.generateKey(this.gameId);
      this.url = `${this.baseHref}match/${this.key}`;
    } else {
      this.gameId = '';
      this.key = '';
      this.url = '';
    }
  }

  private loadFixtures() {
    const url = `https://www.websports.co.za/api/summary/fixturesother/session?action=GET`;

    this.http.get<any>(url, {}).subscribe(
      fixtures => {
        this.fixtures.loadFixtures(fixtures);
        for (let fixture of this.fixtures.fixtures){
          fixture.matchKey = this.matchKey.generateKey(fixture.gameId)
        }
      }
    )
  }

  public onGameIdChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createKey(target.value);
  }

}
