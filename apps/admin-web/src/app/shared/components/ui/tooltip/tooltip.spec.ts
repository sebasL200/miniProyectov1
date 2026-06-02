import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Slot } from '../../../directives/slot/slot';
import { Tooltip } from './tooltip';
import { TooltipSide } from './tooltip.types';

@Component({
  selector: 'ecom-tooltip-host',
  imports: [Tooltip, Slot],
  template: `
    <ecom-tooltip [content]="content" [side]="side">
      <button slot="trigger" type="button">Accion</button>
    </ecom-tooltip>
  `,
})
class TooltipHost {
  content = 'Texto de ayuda';
  side: TooltipSide = 'top';
}

@Component({
  selector: 'ecom-tooltip-slot-host',
  imports: [Tooltip, Slot],
  template: `
    <ecom-tooltip>
      <button slot="trigger" type="button">Accion</button>
      <span slot="content">Ayuda detallada</span>
    </ecom-tooltip>
  `,
})
class TooltipSlotHost {}

describe('Tooltip', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show and hide the tooltip content on hover', async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipHost],
    }).compileComponents();

    const fixture: ComponentFixture<TooltipHost> = TestBed.createComponent(TooltipHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('ecom-tooltip > span') as HTMLElement;
    const tooltipContent = fixture.nativeElement.querySelector('[role="tooltip"]') as HTMLElement;

    expect(tooltipContent.className).toContain('opacity-0');
    expect(tooltipContent.textContent).toContain('Texto de ayuda');

    wrapper.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();

    expect(tooltipContent.className).toContain('opacity-100');

    wrapper.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();

    expect(tooltipContent.className).toContain('opacity-0');
  });

  it('should apply the selected side classes', async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipHost],
    }).compileComponents();

    const fixture: ComponentFixture<TooltipHost> = TestBed.createComponent(TooltipHost);
    fixture.componentInstance.side = 'right';
    fixture.detectChanges();
    await fixture.whenStable();

    const tooltipContent = fixture.nativeElement.querySelector('[role="tooltip"]') as HTMLElement;

    expect(tooltipContent.className).toContain('left-full');
    expect(tooltipContent.className).toContain('origin-left');
  });

  it('should render projected slot content when provided', async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipSlotHost],
    }).compileComponents();

    const fixture: ComponentFixture<TooltipSlotHost> = TestBed.createComponent(TooltipSlotHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const tooltipContent = fixture.nativeElement.querySelector('[role="tooltip"]') as HTMLElement;

    expect(tooltipContent.textContent).toContain('Ayuda detallada');
  });
});
