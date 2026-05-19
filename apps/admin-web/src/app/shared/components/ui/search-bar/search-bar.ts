import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  model,
  numberAttribute,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  buildSearchBarClasses,
  SEARCH_BAR_ICON_CLASSES,
  SEARCH_BAR_INPUT_CLASSES,
} from './search-bar.styles';
import { SearchBarSize } from './search-bar.types';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'ecom-search-bar',
  imports: [FaIconComponent],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class SearchBar implements OnInit {
  className = input('', { alias: 'class' });
  icon = input<IconProp>(faSearch);
  size = input<SearchBarSize>('md');
  debounceTime = input(500, { transform: numberAttribute });
  placeholder = input('Buscar...');
  id = input('search');
  name = input('search');
  title = input('Buscar');
  disabled = input(false, { transform: booleanAttribute });
  value = model<string>('');
  debounce = output<string>();

  readonly hostClasses = computed(() =>
    buildSearchBarClasses({ className: this.className(), size: this.size() }),
  );
  readonly inputClasses = computed(() => SEARCH_BAR_INPUT_CLASSES);
  readonly iconClasses = computed(() => SEARCH_BAR_ICON_CLASSES);

  private readonly input$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.input$
      .pipe(
        debounceTime(this.debounceTime()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.debounce.emit(value);
      });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.input$.next(value);
  }
}
