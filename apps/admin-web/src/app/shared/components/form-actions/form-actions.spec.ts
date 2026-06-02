import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormActionsOptions } from '../../interfaces/form.interface';

import { FormActions } from './form-actions';

describe('FormActions', () => {
  let component: FormActions;
  let fixture: ComponentFixture<FormActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormActions],
    }).compileComponents();

    fixture = TestBed.createComponent(FormActions);
    fixture.componentRef.setInput('actions', new FormActionsOptions());
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
