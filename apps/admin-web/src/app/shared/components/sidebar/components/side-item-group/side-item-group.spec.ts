import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { faTableCellsLarge } from '@fortawesome/free-solid-svg-icons';

import { SideItemGroup } from './side-item-group';

describe('SideItemGroup', () => {
  let component: SideItemGroup;
  let fixture: ComponentFixture<SideItemGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideItemGroup],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SideItemGroup);
    fixture.componentRef.setInput('value', {
      label: 'Administracion',
      href: 'admin',
      icon: faTableCellsLarge,
      childrens: [
        {
          label: 'Categorias',
          href: '/categories',
        },
      ],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
