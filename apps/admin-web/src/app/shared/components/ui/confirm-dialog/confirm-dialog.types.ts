import { ButtonVariant } from '../button/button.types';

export interface ConfirmDialogData {
  message?: string;
  cancelText?: string;
  cancelVariant?: ButtonVariant;
  confirmText?: string;
  confirmVariant?: ButtonVariant;
}
