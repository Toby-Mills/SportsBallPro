import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Fixtures } from '../models/fixture';
import { MatchKeyService } from '../services/match-key.service';
import { SortFixturesPipe } from '../pipes/sort-fixtures.pipe';
import { HomeTeamPipe } from '../pipes/home-team.pipe';
import { OpponentTeamPipe } from '../pipes/opponent-team.pipe';
import { GroupFixturesPipe } from '../pipes/group-fixtures.pipe';
import { SortFixturesByTeamPipe } from '../pipes/sort-fixtures-by-team.pipe';

@Component({
  selector: 'app-fixtures-wynberg',
  standalone: true,
  imports: [    
    CommonModule,
    NgFor,
    SortFixturesPipe,
    SortFixturesByTeamPipe,
    HomeTeamPipe,
    OpponentTeamPipe,
    GroupFixturesPipe
  ],
  templateUrl: './fixtures-wynberg.component.html',
  styleUrl: './fixtures-wynberg.component.css'
})
export class FixturesWynbergComponent  implements OnInit {
  public club:string = 'Wynberg BHS';
  public fixtures: Fixtures = new Fixtures;

  public constructor(
    private http: HttpClient,
    private matchKey: MatchKeyService,
  ){}

  public ngOnInit(): void {
    this.loadFixtures();
  }
  public loadFixtures() {
    let urlEncodedSearch = encodeURI(this.club);

      let url = `https://www.websports.co.za/api/fixture/teamname/${urlEncodedSearch}`

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
}
