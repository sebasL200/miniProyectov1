import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridCell } from './data-grid-cell';

describe('DataGridCell', () => {
  let component: DataGridCell;
  let fixture: ComponentFixture<DataGridCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGridCell],
    }).compileComponents();

    fixture = TestBed.createComponent(DataGridCell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
