import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TeamSearchComponent } from './team-search.component';

describe('TeamSearchComponent', () => {
  let component: TeamSearchComponent;
  let fixture: ComponentFixture<TeamSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamSearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
