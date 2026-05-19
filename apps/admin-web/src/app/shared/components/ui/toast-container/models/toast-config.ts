import { duration } from "@shared/constants/transitions";
import { ToastPosition, ToastType } from "../components/toast/toast.types";
import { Z_INDEX } from "@shared/constants/z-index.const";

export class ToastConfig {
  position: ToastPosition = 'top-right';
  duration: number = duration.normal;
  title: string = '';
  message: string = '';
  zIndex: number = Z_INDEX.TOAST;
  type: ToastType = 'info';

  constructor(init?: Partial<ToastConfig>) {
    Object.assign(this, init);
  }
}
