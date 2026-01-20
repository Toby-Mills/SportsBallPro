import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TeamScoreComponent } from './team-score.component';

describe('TeamScoreComponent', () => {
  let component: TeamScoreComponent;
  let fixture: ComponentFixture<TeamScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamScoreComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeamScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
