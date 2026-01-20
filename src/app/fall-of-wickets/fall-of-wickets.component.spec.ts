import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { FallOfWicketsComponent } from './fall-of-wickets.component';

describe('FallOfWicketsComponent', () => {
  let component: FallOfWicketsComponent;
  let fixture: ComponentFixture<FallOfWicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FallOfWicketsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FallOfWicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
