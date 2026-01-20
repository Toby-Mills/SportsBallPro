import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { WebSportsAPIService } from './web-sports-api.service';

describe('WebSportsAPIService', () => {
  let service: WebSportsAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(WebSportsAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
