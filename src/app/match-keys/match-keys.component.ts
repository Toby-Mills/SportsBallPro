import { APP_BASE_HREF, CommonModule, NgFor } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FixtureSummaries } from '../models/fixture-summary';
import { HttpClient } from '@angular/common/http';
import { MatchKeyService } from '../services/match-key.service'
import { SortFixturesPipe } from '../pipes/sort-fixtures.pipe';
import { environment } from '../../../src/environments/environment';

@Component({
    selector: 'app-match-keys',
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
  public fixtureSummaries: FixtureSummaries = new FixtureSummaries;

  constructor(
    private http: HttpClient,
    private matchKey: MatchKeyService,
  ) { }

  ngOnInit() {
    
  }

  public createKey(Id: string | null) {
    if (Id) {
      this.gameId = Id;;
      this.key = this.matchKey.generateKey(this.gameId);
      console.log('baseHref', `${environment.baseHref}`);
      //this.url = `${this.baseHref}match/${this.key}`;
      this.url = `${environment.baseHref}/match/${this.key}`
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
        this.fixtureSummaries = new FixtureSummaries;
        this.fixtureSummaries.loadFixtures(fixtures);
        for (let fixture of this.fixtureSummaries.fixtureSummaries) {
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
