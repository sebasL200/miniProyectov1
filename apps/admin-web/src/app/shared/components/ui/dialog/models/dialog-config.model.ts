import { Z_INDEX } from '../../../../constants/z-index.const';

export class DialogConfig {
  title?: string;
  showCloseButton = true;
  closeOnEscape = true;
  closeOnBackdropClick = true;
  width?: string;
  maxWidth?: string;
  height?: string;
  maxHeight?: string;
  contentOverflowVisible?: boolean = false;
  zIndex?: number = Z_INDEX.MODAL;

  constructor(config?: Partial<DialogConfig>) {
    if (config) {
      Object.assign(this, config);
    }
  }
}
