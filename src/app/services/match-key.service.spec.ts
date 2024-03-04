import { TestBed } from '@angular/core/testing';

import { MatchKeyService } from './match-key.service';

describe('MatchKeyService', () => {
  let service: MatchKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatchKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
