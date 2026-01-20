import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubFixturesComponent } from './club-fixtures.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ClubFixturesComponent', () => {
  let component: ClubFixturesComponent;
  let fixture: ComponentFixture<ClubFixturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubFixturesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: { area: 'wynberg' }
              }
            },
            snapshot: {
              data: {
                clubName: 'Test Club',
                logoUrl: 'https://example.com/logo.png',
                title: 'Test Club Cricket'
              },
              params: {}
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClubFixturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set clubName from route data', () => {
    expect(component.clubName).toBe('Test Club');
  });

  it('should set logoUrl from route data', () => {
    expect(component.logoUrl).toBe('https://example.com/logo.png');
  });

  it('should set title from route data', () => {
    expect(component.title).toBe('Test Club Cricket');
  });

  it('should accept Input properties', () => {
    component.clubName = 'Custom Club';
    component.logoUrl = 'https://custom.com/logo.png';
    component.title = 'Custom Title';
    
    expect(component.clubName).toBe('Custom Club');
    expect(component.logoUrl).toBe('https://custom.com/logo.png');
    expect(component.title).toBe('Custom Title');
  });
});
