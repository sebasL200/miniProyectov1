import {
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  OnDestroy,
  signal,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { DialogRef } from './models/dialog-ref.model';
import { IDialogComponent } from './interfaces/dialog-component.interface';
import { DialogConfig } from './models/dialog-config.model';
import { Z_INDEX } from '../../../constants/z-index.const';
import { duration } from '../../../constants/transitions';
import { Button } from '../button/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ecom-dialog',
  imports: [Button, FaIconComponent],
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
  host: {
    class: 'absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50',
    '[style.z-index]': 'zIndex()',
  },
})
export class Dialog<T, R> implements OnDestroy {
  readonly faX = faX;
  private readonly destroyRef = inject(DestroyRef);
  showDialog = signal(false);
  hidden = signal(true);
  dialogRef = signal<DialogRef<T, R> | null>(null);
  dialogConfig = signal<DialogConfig | null>(null);
  child = signal<Type<IDialogComponent<T, R>> | null>(null);
  componentRef = signal<ComponentRef<IDialogComponent<T, R>> | null>(null);

  content = viewChild('content', { read: ViewContainerRef });

  zIndex = computed(() => this.dialogConfig()?.zIndex || Z_INDEX.MODAL);
  width = computed(() => this.dialogConfig()?.width || 'auto');
  height = computed(() => this.dialogConfig()?.height || 'auto');
  contentOverflowVisible = computed(
    () => this.dialogConfig()?.contentOverflowVisible === true,
  );

  closed$ = new Subject<void>();

  constructor() {
    effect(() => {
      if (this.child() && this.dialogRef() && this.dialogConfig()) {
        this.initChildComponent();
      }
    });
  }

  ngOnDestroy(): void {
    this.closed$.complete();
    this.componentRef()?.destroy();
    this.content()?.clear();
  }

  private initChildComponent(): void {
    const childComponent = this.child();
    if (!childComponent || !this.content()) {
      return;
    }
    this.componentRef.set(this.content()!.createComponent(childComponent));
    this.componentRef()?.instance.setDialogRef(this.dialogRef()!);
    this.bindDialogRefSubscriptions();
    this.showDialog.set(true);
  }

  private async waitAnimationEnd(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration.normal));
  }

  private async closeShell(): Promise<void> {
    if (!this.showDialog() || !this.dialogRef()) {
      return;
    }

    this.showDialog.set(false);
    await this.waitAnimationEnd();
    this.closed$.next();
  }

  async onClose(): Promise<void> {
    if (!this.showDialog() || !this.dialogRef()) {
      return;
    }

    const confirmed = await this.dialogRef()!.requestClose();

    if (!confirmed) {
      return;
    }

    await this.closeShell();
    this.dialogRef()!.finalizeClose();
  }

  private bindDialogRefSubscriptions(): void {
    this.dialogRef()
      ?.onAfterClose$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => void this.closeShell());
  }

  @HostListener('document:keydown', ['$event'])
  protected async handleKeyboardEvent(event: KeyboardEvent): Promise<void> {
    if (event.key !== 'Escape' || this.dialogConfig()?.closeOnEscape === false) {
      return;
    }
    await this.onClose();
  }

  @HostListener('click', ['$event'])
  protected async onBackdropClick(event: MouseEvent): Promise<void> {
    if (
      event.target !== event.currentTarget ||
      this.dialogConfig()?.closeOnBackdropClick === false
    ) {
      return;
    }
    await this.onClose();
  }
}
