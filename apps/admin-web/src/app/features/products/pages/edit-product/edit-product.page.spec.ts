import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductPage } from './edit-product.page';

describe('EditProductPage', () => {
  let component: EditProductPage;
  let fixture: ComponentFixture<EditProductPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProductPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProductPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
