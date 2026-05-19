import { Component, input } from '@angular/core';

@Component({
    selector: 'ecom-truncate-text',
    imports: [],
    templateUrl: './truncate-text.html',
    styleUrl: './truncate-text.css',
    host: {
        class: '',
        '(mouseenter)': 'onMouseEnter($event)',
    },
})
export class TruncateText {
    text = input.required<string | undefined>();
    showFullText = false;

    onMouseEnter(event: MouseEvent): void {
        console.log('Mouse entered:', event);
    }
}
