import { TestBed } from '@angular/core/testing';

import { AuthorSearch } from './author-search';

describe('AuthorSearch', () => {
  let service: AuthorSearch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorSearch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
