import { APP_BASE_HREF, CommonModule, NgFor } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Fixtures } from '../models/fixture';
import { HttpClient } from '@angular/common/http';
import { MatchKeyService } from '../services/match-key.service'
import { SortFixturesPipe } from '../pipes/sort-fixtures.pipe';


@Component({
  selector: 'app-match-keys',
  standalone: true,
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
  imports: [
    CommonModule,
    NgFor,
    SortFixturesPipe
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
    
  }

  public createKey(Id: string | null) {
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

  public loadFixtures(search: string) {
    let url = '';
    let urlEncodedSearch = encodeURI(search);

    if (search > '') {
      url = `https://www.websports.co.za/api/fixture/teamname/${urlEncodedSearch}`
    } else {
      url = `https://www.websports.co.za/api/summary/fixturesother/session?action=GET`;
    }
    this.http.get<any>(url, {}).subscribe(
      fixtures => {
        this.fixtures = new Fixtures;
        this.fixtures.loadFixtures(fixtures);
        for (let fixture of this.fixtures.fixtures) {
          fixture.matchKey = this.matchKey.generateKey(fixture.gameId)
        }
      }
    )
  }

  public onGameIdChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.createKey(target.value);
  }

  public onKeyPress(event: KeyboardEvent, search: string) { 
    if (event.key === 'Enter') {
      this.loadFixtures(search);
    }
  }

}
