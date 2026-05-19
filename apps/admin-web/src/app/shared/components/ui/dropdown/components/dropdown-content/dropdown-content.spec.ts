import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownContent } from './dropdown-content';

describe('DropdownContent', () => {
  let component: DropdownContent;
  let fixture: ComponentFixture<DropdownContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownContent],
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
