import { TestBed } from '@angular/core/testing';

import { ConfirmDialog } from '@shared/components/ui/confirm-dialog/confirm-dialog';
import { DialogService } from './dialog.service';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open confirm dialog through openConfirm', () => {
    const openSpy = vi.spyOn(service, 'open').mockReturnValue({} as any);

    service.openConfirm({ message: 'Confirmar prueba' });

    expect(openSpy).toHaveBeenCalledWith(ConfirmDialog, { message: 'Confirmar prueba' }, {
      title: 'Confirmación',
    });
  });
});
