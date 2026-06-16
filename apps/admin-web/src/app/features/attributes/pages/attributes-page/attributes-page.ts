import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLayout, PageHeader } from '../../../../shared/components';
import { AttributesQueryService } from '../../services/attributes-query/attributes-query.service';
import { Attribute } from '../../../../shared/models';

@Component({
  selector: 'app-attributes-page',
  standalone: true,
  imports: [CommonModule, PageLayout, PageHeader],
  templateUrl: './attributes-page.html',
})
export class AttributesPageComponent implements OnInit {
  private readonly attributesQuery = inject(AttributesQueryService);
  readonly attributes = signal<Attribute[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.attributesQuery
      .getAttributes({ paginationType: 'none', query: '' })
      .subscribe({
        next: (response) => {
          this.attributes.set(response.data?.attributes ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
