import { Component, input } from '@angular/core';
import { Spinner } from "../ui";

@Component({
    selector: 'ecom-page-layout',
    imports: [Spinner],
    templateUrl: './page-layout.html',
    styleUrl: './page-layout.css',
    host: {
        class: 'block overflow-x-hidden h-full overflow-y-auto',
        '[class.p-6]': '!isLoading()',
    },
})
export class PageLayout {
    isLoading = input<boolean>(false, { alias: 'loading' });
}
