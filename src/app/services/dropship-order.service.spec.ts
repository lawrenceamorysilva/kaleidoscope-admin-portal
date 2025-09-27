import { TestBed } from '@angular/core/testing';

import { DropshipOrderService } from './dropship-order.service';

describe('DropshipOrderService', () => {
  let service: DropshipOrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropshipOrderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
