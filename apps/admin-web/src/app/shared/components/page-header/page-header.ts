import { Component, inject, input } from '@angular/core';
import { Button } from '../ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Location } from '@angular/common';

@Component({
  selector: 'header[ecom-page-header]',
  imports: [Button, FaIconComponent],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
  host: {
    class: 'flex mb-5',
  },
})
export class PageHeader {
  private readonly location = inject(Location);

  protected readonly faArrowLeft = faArrowLeft;
  readonly isShowBackButton = input<boolean>(false, { alias: 'showBackButton' });

  readonly title = input<string>('');
  readonly description = input<string>('');

  goBack() {
    this.location.back();
  }
}
