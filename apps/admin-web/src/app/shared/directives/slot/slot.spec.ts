import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Slot } from './slot';

@Component({
  imports: [Slot],
  template: `<div slot="header"></div>`,
})
class TestHostComponent {
  @ViewChild(Slot) slotDirective!: Slot;
}

describe('Slot', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = fixture.componentInstance.slotDirective;

    expect(directive).toBeTruthy();
    expect(directive.slot()).toBe('header');
  });
});
