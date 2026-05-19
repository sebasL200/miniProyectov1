import { Component, computed, input, output } from '@angular/core';
import { Button } from '../ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'ecom-pagination-footer',
  imports: [Button, FaIconComponent],
  templateUrl: './pagination-footer.html',
  styleUrl: './pagination-footer.css',
  host: {
    class: 'flex items-center justify-end gap-4 w-full',
  },
})
export class PaginationFooter {
  readonly faArrowLeft = faArrowLeft;
  readonly faArrowRight = faArrowRight;

  pages = input<number>(1);
  currentPage = input<number>(1);
  pageChange = output<number>();

  visiblePages = computed(() => {
    const total = this.pages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Siempre incluir primera y última
    const first = 1;
    const last = total;

    // Páginas del medio (3 slots)
    let middle: number[] = [];

    if (current <= 3) {
      middle = [2, 3, 4];
    } else if (current >= total - 2) {
      middle = [total - 3, total - 2, total - 1];
    } else {
      middle = [current - 1, current, current + 1];
    }

    return [first, ...middle, last];
  });

  goTo(page: number) {
    const total = this.pages();
    if (page < 1 || page > total) return;
    this.pageChange.emit(page);
  }
}
