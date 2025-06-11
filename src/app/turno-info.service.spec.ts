import { TestBed } from '@angular/core/testing';

import { TurnoInfoService } from './turno-info.service';

describe('TurnoInfoService', () => {
  let service: TurnoInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurnoInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
