import { TestBed } from '@angular/core/testing';

import { PlayerAggregationService } from './player-aggregation.service';

describe('PlayerAggregationService', () => {
  let service: PlayerAggregationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerAggregationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
