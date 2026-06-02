import { duration } from '../../../../constants/transitions';
import { ToastPosition, ToastType } from "../components/toast/toast.types";
import { Z_INDEX } from '../../../../constants/z-index.const';

export class ToastConfig {
  position: ToastPosition = 'top-right';
  duration: number = duration.normal;
  title = '';
  message = '';
  zIndex: number = Z_INDEX.TOAST;
  type: ToastType = 'info';

  constructor(init?: Partial<ToastConfig>) {
    Object.assign(this, init);
  }
}
