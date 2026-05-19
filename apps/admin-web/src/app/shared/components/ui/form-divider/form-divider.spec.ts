import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDivider } from './form-divider';

describe('FormDivider', () => {
  let component: FormDivider;
  let fixture: ComponentFixture<FormDivider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormDivider],
    }).compileComponents();

    fixture = TestBed.createComponent(FormDivider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
