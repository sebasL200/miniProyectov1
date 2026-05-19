import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellTemplate } from './cell-template';

@Component({
  imports: [CellTemplate],
  template: `<ng-template ecom-cell-template [template]="'actions'"></ng-template>`,
})
class TestHostComponent {
  @ViewChild(CellTemplate) cellTemplateDirective!: CellTemplate;
}

describe('CellTemplate', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance with its template reference', () => {
    const directive = fixture.componentInstance.cellTemplateDirective;

    expect(directive).toBeTruthy();
    expect(directive.cellTemplate()).toBe('actions');
    expect(directive.template).toBeTruthy();
  });
});
