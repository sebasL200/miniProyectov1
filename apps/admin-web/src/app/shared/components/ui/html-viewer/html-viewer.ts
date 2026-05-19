import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { InputRichTextareaSize } from '../input-rich-textarea/input-rich-textarea.types';

const HTML_VIEWER_BASE_CLASSES = [
    'ecom-html-viewer',
    'block',
    'w-full',
    'rounded-sm',
    'border',
    'border-border',
    'bg-muted/20',
    'text-foreground',
    'shadow-sm',
].join(' ');

const HTML_VIEWER_CONTENT_BASE_CLASSES = [
    'ecom-html-viewer__content',
    'block',
    'w-full',
    'whitespace-pre-wrap',
    'break-words',
    'overflow-y-auto',
].join(' ');

const HTML_VIEWER_SIZE_CLASSES: Record<InputRichTextareaSize, string> = {
    xs: 'min-h-20 px-2.5 py-2 text-xs',
    sm: 'min-h-24 px-3 py-2.5 text-sm',
    md: 'min-h-32 px-4 py-3 text-base',
    lg: 'min-h-36 px-5 py-3.5 text-lg',
    xl: 'min-h-40 px-6 py-4 text-xl',
};

@Component({
    selector: 'ecom-html-viewer',
    imports: [],
    templateUrl: './html-viewer.html',
    styleUrl: './html-viewer.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class]': 'hostClasses()',
    },
})
export class HtmlViewer {
    readonly className = input('', { alias: 'class' });
    readonly value = input<string>('');
    readonly placeholder = input<string>('Sin contenido');
    readonly size = input<InputRichTextareaSize>('md');

    protected readonly hostClasses = computed(() => 'contents');
    protected readonly viewerClasses = computed(() =>
        twMerge(HTML_VIEWER_BASE_CLASSES, this.className()),
    );
    protected readonly contentClasses = computed(() =>
        twMerge(HTML_VIEWER_CONTENT_BASE_CLASSES, HTML_VIEWER_SIZE_CLASSES[this.size()]),
    );
    protected readonly hasContent = computed(() => this.value().trim().length > 0);
}
