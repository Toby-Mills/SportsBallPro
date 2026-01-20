import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PlayerAggregationService } from './player-aggregation.service';

describe('PlayerAggregationService', () => {
  let service: PlayerAggregationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PlayerAggregationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
