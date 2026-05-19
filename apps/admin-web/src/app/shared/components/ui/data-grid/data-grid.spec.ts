import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGrid } from './data-grid';

describe('DataGrid', () => {
  let component: DataGrid;
  let fixture: ComponentFixture<DataGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(DataGrid);
    fixture.componentRef.setInput('columns', [{ label: 'Nombre', field: 'name' }]);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders placeholder rows until reaching the configured rowsLimit', async () => {
    fixture.componentRef.setInput('data', [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
    fixture.componentRef.setInput('rowsLimit', 5);

    fixture.detectChanges();
    await fixture.whenStable();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');

    expect(rows.length).toBe(5);
  });
});
