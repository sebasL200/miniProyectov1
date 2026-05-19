import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { faTableCellsLarge } from '@fortawesome/free-solid-svg-icons';

import { SideItemOption } from './side-item-option';

describe('SideItemOption', () => {
  let component: SideItemOption;
  let fixture: ComponentFixture<SideItemOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideItemOption],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SideItemOption);
    fixture.componentRef.setInput('value', {
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
