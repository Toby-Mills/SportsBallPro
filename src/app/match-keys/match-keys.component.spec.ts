import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchKeysComponent } from './match-keys.component';

describe('MatchKeysComponent', () => {
  let component: MatchKeysComponent;
  let fixture: ComponentFixture<MatchKeysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchKeysComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchKeysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
