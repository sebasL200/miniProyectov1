import { ToastConfig } from './toast-config';

export class ToastItem {
  id: string;
  title?: string;
  config: ToastConfig;

  constructor(id: string, title: string | undefined, config: ToastConfig) {
    this.id = id;
    this.title = title;
    this.config = config;
    }
}
