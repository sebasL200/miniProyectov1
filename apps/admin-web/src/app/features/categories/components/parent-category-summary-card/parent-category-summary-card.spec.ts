import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentCategorySummaryCard } from './parent-category-summary-card';

describe('ParentCategorySummaryCard', () => {
  let component: ParentCategorySummaryCard;
  let fixture: ComponentFixture<ParentCategorySummaryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentCategorySummaryCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParentCategorySummaryCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
