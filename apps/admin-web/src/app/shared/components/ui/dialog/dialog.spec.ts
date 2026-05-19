import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dialog } from './dialog';
import { DialogConfig } from './models/dialog-config.model';
import { DialogRef } from './models/dialog-ref.model';

describe('Dialog', () => {
  let component: Dialog<any, any>;
  let fixture: ComponentFixture<Dialog<any, any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dialog],
    }).compileComponents();

    fixture = TestBed.createComponent(Dialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close on escape when enabled', async () => {
    component.dialogConfig.set(new DialogConfig({ closeOnEscape: true }));
    component.dialogRef.set(new DialogRef(undefined));
    component.showDialog.set(true);
    const onCloseSpy = vi.spyOn(component, 'onClose').mockResolvedValue();

    await (component as any).handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(onCloseSpy).toHaveBeenCalledOnce();
  });

  it('should close on backdrop click when enabled', async () => {
    component.dialogConfig.set(new DialogConfig({ closeOnBackdropClick: true }));
    component.dialogRef.set(new DialogRef(undefined));
    component.showDialog.set(true);
    const onCloseSpy = vi.spyOn(component, 'onClose').mockResolvedValue();

    const event = {
      target: fixture.nativeElement,
      currentTarget: fixture.nativeElement,
    } as unknown as MouseEvent;

    await (component as any).onBackdropClick(event);

    expect(onCloseSpy).toHaveBeenCalledOnce();
  });
});
