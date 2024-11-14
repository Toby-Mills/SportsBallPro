import { TestBed } from '@angular/core/testing';

import { WebSportsAPIService } from './web-sports-api.service';

describe('WebSportsAPIService', () => {
  let service: WebSportsAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSportsAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
