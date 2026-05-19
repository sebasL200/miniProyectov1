import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { faTableCellsLarge } from '@fortawesome/free-solid-svg-icons';

import { SideItem } from './side-item';

describe('SideItem', () => {
  let component: SideItem;
  let fixture: ComponentFixture<SideItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideItem],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SideItem);
    fixture.componentRef.setInput('item', {
      label: 'Inicio',
      href: '/',
      icon: faTableCellsLarge,
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
