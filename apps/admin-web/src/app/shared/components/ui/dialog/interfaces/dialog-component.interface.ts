import { DialogRef } from "../models/dialog-ref.model";

export interface IDialogComponent<T, R> {

  close?(result?: R): void;
  setDialogRef(ref: DialogRef<T, R>): void;
}

