import { Subject } from "rxjs";

export class DialogRef<T, R> {

  data: T;
  private beforeClosedFn?: (result?: R) => Promise<void>;
  private preventCloseFn?: (result?: R) => Promise<boolean>;
  onClose$: Subject<R | undefined> = new Subject<R | undefined>();
  onAfterClose$: Subject<R | undefined> = new Subject<R | undefined>();
  onClosePrevented$: Subject<void> = new Subject<void>();

  constructor(data: T) {
    this.data = data;
  }

  setBeforeClosed(fn: (result?: R) => Promise<void>): void {
    this.beforeClosedFn = fn;
  }

  setPreventClose(fn: (result?: R) => Promise<boolean>): void {
    this.preventCloseFn = fn;
  }

  async requestClose(result?: R): Promise<boolean> {
    let confirmed = true;
    if (this.beforeClosedFn) {
      await this.beforeClosedFn(result);
    }
    if (this.preventCloseFn) {
      confirmed = await this.preventCloseFn(result);
    }
    if (!confirmed) {
      this.onClosePrevented$.next();
      return false;
    }
    this.onClosePrevented$.complete();
    return true;
  }

  async close(result?: R): Promise<R | undefined> {
    const confirmed = await this.requestClose(result);

    if (!confirmed) {
      return result;
    }

    this.finalizeClose(result);
    return result;
  }

  finalizeClose(result?: R): void {
    this.onClosePrevented$.complete();
    this.onClose$.next(result);
    this.onClose$.complete();
    this.onAfterClose$.next(result);
    this.onAfterClose$.complete();
  }
}
