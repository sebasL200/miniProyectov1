import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsTable } from './brands-table';

describe('BrandsTable', () => {
  let component: BrandsTable;
  let fixture: ComponentFixture<BrandsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
