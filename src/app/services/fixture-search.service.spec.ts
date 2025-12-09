import { TestBed } from '@angular/core/testing';

import { FixtureSearchService } from './fixture-search.service';

describe('FixtureSearchService', () => {
  let service: FixtureSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixtureSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
