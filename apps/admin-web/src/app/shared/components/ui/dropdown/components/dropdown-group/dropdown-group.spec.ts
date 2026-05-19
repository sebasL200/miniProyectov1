import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownGroup } from './dropdown-group';

describe('DropdownGroup', () => {
  let component: DropdownGroup;
  let fixture: ComponentFixture<DropdownGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
