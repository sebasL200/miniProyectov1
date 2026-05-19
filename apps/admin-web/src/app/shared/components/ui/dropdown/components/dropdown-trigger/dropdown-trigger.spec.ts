import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownTrigger } from './dropdown-trigger';

describe('DropdownTrigger', () => {
  let component: DropdownTrigger;
  let fixture: ComponentFixture<DropdownTrigger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownTrigger],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownTrigger);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
