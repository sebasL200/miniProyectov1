import { Z_INDEX } from "@shared/constants/z-index.const";

export class DialogConfig {
  title?: string;
  showCloseButton: boolean = true;
  closeOnEscape: boolean = true;
  closeOnBackdropClick: boolean = true;
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
