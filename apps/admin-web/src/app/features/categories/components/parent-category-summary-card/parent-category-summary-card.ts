import { Component, input } from '@angular/core';
import { Card } from '../../../../shared/components/ui/card/card';
import { Spinner } from '../../../../shared/components/ui/spinner/spinner';
import { InputText } from '../../../../shared/components/ui/input-text/input-text';
import { Label } from '../../../../shared/components/ui/label/label';
import { CategorySummary } from './types';
import { FormDivider } from '../../../../shared/components/ui/form-divider/form-divider';

@Component({
  selector: 'ecom-parent-category-summary-card',
  imports: [Card, Spinner, InputText, FormDivider, Label],
  templateUrl: './parent-category-summary-card.html',
  styleUrl: './parent-category-summary-card.css',
})
export class ParentCategorySummaryCard {
  parentCategory = input.required<CategorySummary | null>({
    alias: 'category',
  });
}
