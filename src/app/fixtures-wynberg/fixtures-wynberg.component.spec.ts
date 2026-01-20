import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { FixturesWynbergComponent } from './fixtures-wynberg.component';

describe('FixturesWynbergComponent', () => {
  let component: FixturesWynbergComponent;
  let fixture: ComponentFixture<FixturesWynbergComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixturesWynbergComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {}, queryParams: {} },
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixturesWynbergComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
