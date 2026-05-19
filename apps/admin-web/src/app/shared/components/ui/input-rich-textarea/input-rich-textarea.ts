import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { buildFormValueControlProvider } from '@shared/utils/form-value-control-provider.builder';
import { ToolbarButton } from './components/toolbar-button/toolbar-button';
import {
  buildInputRichTextareaClasses,
  buildInputRichTextareaEditorClasses,
  buildInputRichTextareaPlaceholderClasses,
  INPUT_RICH_TEXTAREA_EDITOR_CONTAINER_CLASSES,
  INPUT_RICH_TEXTAREA_TOOLBAR_CLASSES,
  INPUT_RICH_TEXTAREA_TOOLBAR_DIVIDER_CLASSES,
  INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_CLASSES,
  INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_PREFIX_CLASSES,
  INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_WRAPPER_CLASSES,
} from './input-rich-textarea.styles';
import {
  InputRichTextareaParagraphStyleId,
  InputRichTextareaParagraphStyleOption,
  InputRichTextareaSize,
  InputRichTextareaToolbarAction,
  InputRichTextareaToolbarActionId,
  InputRichTextareaToolbarOptions,
} from './input-rich-textarea.types';

const PARAGRAPH_STYLE_OPTIONS: InputRichTextareaParagraphStyleOption[] = [
  { id: 'paragraph', label: 'Parrafo', title: 'Parrafo', commandValue: '<p>', tagName: 'P' },
  { id: 'heading-1', label: 'Titulo 1', title: 'Titulo 1', commandValue: '<h1>', tagName: 'H1' },
  {
    id: 'heading-2',
    label: 'Titulo 2',
    title: 'Titulo 2',
    commandValue: '<h2>',
    tagName: 'H2',
  },
  {
    id: 'heading-3',
    label: 'Titulo 3',
    title: 'Titulo 3',
    commandValue: '<h3>',
    tagName: 'H3',
  },
];

const STRUCTURE_TOOLBAR_ACTIONS: InputRichTextareaToolbarAction[] = [
  {
    id: 'collapse-block',
    label: '—',
    title: 'Colapsar/Expandir bloque',
  },
];

const TEXT_STYLE_TOOLBAR_ACTIONS: InputRichTextareaToolbarAction[] = [
  { id: 'bold', label: 'B', title: 'Negrita', command: 'bold' },
  { id: 'italic', label: 'I', title: 'Cursiva', command: 'italic' },
  { id: 'strikethrough', label: 'S̶', title: 'Tachado', command: 'strikeThrough' },
  { id: 'underline', label: 'U', title: 'Subrayado', command: 'underline' },
];

const LIST_TOOLBAR_ACTIONS: InputRichTextareaToolbarAction[] = [
  {
    id: 'unordered-list',
    label: '≡ •',
    title: 'Lista con vinetas',
    command: 'insertUnorderedList',
  },
  {
    id: 'ordered-list',
    label: '≡ 1',
    title: 'Lista numerada',
    command: 'insertOrderedList',
  },
  { id: 'outdent', label: '⇤≡', title: 'Reducir sangria', command: 'outdent' },
  { id: 'indent', label: '≡⇥', title: 'Aumentar sangria', command: 'indent' },
];

const ALIGNMENT_TOOLBAR_ACTIONS: InputRichTextareaToolbarAction[] = [
  { id: 'align-left', label: '≡ ←', title: 'Alinear a la izquierda', command: 'justifyLeft' },
  { id: 'align-center', label: '≡ ↔', title: 'Centrar', command: 'justifyCenter' },
  { id: 'align-right', label: '≡ →', title: 'Alinear a la derecha', command: 'justifyRight' },
  { id: 'justify', label: '≡≡', title: 'Justificar', command: 'justifyFull' },
];

const LINK_TOOLBAR_ACTIONS: InputRichTextareaToolbarAction[] = [
  { id: 'link', label: '🔗', title: 'Insertar enlace', command: 'createLink' },
];

const TOOLBAR_ACTIONS_WITH_COMMAND_STATE = new Set<InputRichTextareaToolbarActionId>([
  'bold',
  'italic',
  'strikethrough',
  'underline',
  'unordered-list',
  'ordered-list',
  'align-left',
  'align-center',
  'align-right',
  'justify',
]);

const DEFAULT_INPUT_RICH_TEXTAREA_TOOLBAR_OPTIONS: InputRichTextareaToolbarOptions = {
  bold: true,
  underline: true,
  indent: true,
  'unordered-list': true,
};

type InputRichTextareaToolbarSection = {
  id: 'structure' | 'paragraph-style' | 'text-style' | 'list' | 'alignment' | 'link';
  type: 'actions' | 'paragraph-style';
  actions?: InputRichTextareaToolbarAction[];
};

@Component({
  selector: 'ecom-input-rich-textarea',
  imports: [ToolbarButton],
  templateUrl: './input-rich-textarea.html',
  styleUrl: './input-rich-textarea.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [buildFormValueControlProvider(InputRichTextarea)],
  host: {
    '[class]': 'hostClasses()',
    '(document:selectionchange)': 'onDocumentSelectionChange()',
  },
})
export class InputRichTextarea implements FormValueControl<string>, ControlValueAccessor {
  readonly className = input('', { alias: 'class' });
  readonly size = input<InputRichTextareaSize>('md');
  readonly toolbarOptions = input<InputRichTextareaToolbarOptions | null>(null);
  readonly value = model<string>('');
  readonly id = input<string>('');
  readonly name = input<string>('');
  readonly title = input<string>('');
  readonly placeholder = input<string>('Write rich text here...');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  private readonly documentRef = inject(DOCUMENT);
  private readonly editorElement = viewChild<ElementRef<HTMLDivElement>>('editorElement');
  private readonly cvaDisabled = signal(false);
  private readonly isFocused = signal(false);
  private readonly activeToolbarActionIds = signal<InputRichTextareaToolbarActionId[]>([]);
  protected readonly selectedParagraphStyleId = signal<InputRichTextareaParagraphStyleId>('paragraph');
  private savedSelectionRange: Range | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly hostClasses = computed(() => 'contents');
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly rootClasses = computed(() =>
    buildInputRichTextareaClasses({
      className: this.className(),
      focused: this.isFocused(),
      disabled: this.isDisabled(),
      readonly: this.readonly(),
    }),
  );
  protected readonly toolbarClasses = computed(() => INPUT_RICH_TEXTAREA_TOOLBAR_CLASSES);
  protected readonly toolbarDividerClasses = computed(() => INPUT_RICH_TEXTAREA_TOOLBAR_DIVIDER_CLASSES);
  protected readonly toolbarSelectWrapperClasses = computed(
    () => INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_WRAPPER_CLASSES,
  );
  protected readonly toolbarSelectPrefixClasses = computed(
    () => INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_PREFIX_CLASSES,
  );
  protected readonly toolbarSelectClasses = computed(() => INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_CLASSES);
  protected readonly editorContainerClasses = computed(
    () => INPUT_RICH_TEXTAREA_EDITOR_CONTAINER_CLASSES,
  );
  protected readonly editorClasses = computed(() =>
    buildInputRichTextareaEditorClasses({
      size: this.size(),
      disabled: this.isDisabled(),
      readonly: this.readonly(),
    }),
  );
  protected readonly placeholderClasses = computed(() =>
    buildInputRichTextareaPlaceholderClasses(this.size()),
  );
  protected readonly resolvedToolbarOptions = computed(
    () => this.toolbarOptions() ?? DEFAULT_INPUT_RICH_TEXTAREA_TOOLBAR_OPTIONS,
  );
  protected readonly showPlaceholder = computed(() => this.value().length === 0);
  protected readonly editorContentEditable = computed(() =>
    this.isDisabled() || this.readonly() ? 'false' : 'true',
  );
  protected readonly paragraphStyleOptions = PARAGRAPH_STYLE_OPTIONS;
  protected readonly structureToolbarActions = computed(() =>
    this.mapToolbarActions(this.getVisibleToolbarActions(STRUCTURE_TOOLBAR_ACTIONS)),
  );
  protected readonly showParagraphStyle = computed(() =>
    this.isToolbarOptionEnabled('paragraph-style'),
  );
  protected readonly textStyleToolbarActions = computed(() =>
    this.mapToolbarActions(this.getVisibleToolbarActions(TEXT_STYLE_TOOLBAR_ACTIONS)),
  );
  protected readonly listToolbarActions = computed(() =>
    this.mapToolbarActions(this.getVisibleToolbarActions(LIST_TOOLBAR_ACTIONS)),
  );
  protected readonly alignmentToolbarActions = computed(() =>
    this.mapToolbarActions(this.getVisibleToolbarActions(ALIGNMENT_TOOLBAR_ACTIONS)),
  );
  protected readonly linkToolbarActions = computed(() =>
    this.mapToolbarActions(this.getVisibleToolbarActions(LINK_TOOLBAR_ACTIONS)),
  );
  protected readonly toolbarSections = computed<InputRichTextareaToolbarSection[]>(() => {
    const sections: InputRichTextareaToolbarSection[] = [];
    const structureToolbarActions = this.structureToolbarActions();
    const textStyleToolbarActions = this.textStyleToolbarActions();
    const listToolbarActions = this.listToolbarActions();
    const alignmentToolbarActions = this.alignmentToolbarActions();
    const linkToolbarActions = this.linkToolbarActions();

    if (structureToolbarActions.length > 0) {
      sections.push({ id: 'structure', type: 'actions', actions: structureToolbarActions });
    }

    if (this.showParagraphStyle()) {
      sections.push({ id: 'paragraph-style', type: 'paragraph-style' });
    }

    if (textStyleToolbarActions.length > 0) {
      sections.push({ id: 'text-style', type: 'actions', actions: textStyleToolbarActions });
    }

    if (listToolbarActions.length > 0) {
      sections.push({ id: 'list', type: 'actions', actions: listToolbarActions });
    }

    if (alignmentToolbarActions.length > 0) {
      sections.push({ id: 'alignment', type: 'actions', actions: alignmentToolbarActions });
    }

    if (linkToolbarActions.length > 0) {
      sections.push({ id: 'link', type: 'actions', actions: linkToolbarActions });
    }

    return sections;
  });

  constructor() {
    effect(() => {
      this.syncEditorValue(this.value());
    });
  }

  writeValue(value: string | null): void {
    this.value.set(this.normalizeHtml(value ?? ''));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  focus(options?: FocusOptions): void {
    this.editorElement()?.nativeElement.focus(options);
    this.restoreSavedSelection();
  }

  protected trackByAction(index: number, action: InputRichTextareaToolbarAction): string {
    return `${action.id}-${index}`;
  }

  protected trackByParagraphStyle(
    index: number,
    option: InputRichTextareaParagraphStyleOption,
  ): string {
    return `${option.id}-${index}`;
  }

  protected trackByToolbarSection(index: number, section: InputRichTextareaToolbarSection): string {
    return `${section.id}-${index}`;
  }

  protected onEditorInput(): void {
    this.captureSelectionRange();
    this.syncValueFromEditor();
    this.refreshToolbarState();
  }

  protected onEditorFocus(): void {
    this.isFocused.set(true);
    this.captureSelectionRange();
    this.refreshToolbarState();
  }

  protected onEditorBlur(): void {
    this.isFocused.set(false);
    this.activeToolbarActionIds.set([]);
    this.onTouched();
  }

  protected onEditorSelectionInteraction(): void {
    this.captureSelectionRange();
    this.refreshToolbarState();
  }

  protected onToolbarAction(action: InputRichTextareaToolbarAction): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    if (!this.focusEditorAndRestoreSelection()) {
      return;
    }

    switch (action.id) {
      case 'collapse-block':
        this.toggleCollapsibleBlock();
        break;
      case 'link':
        this.insertLink();
        break;
      default:
        if (!action.command) {
          return;
        }

        this.executeNativeCommand(action.command, action.value);
        break;
    }

    this.syncValueFromEditor();
    this.refreshToolbarState();
  }

  protected onParagraphStyleChange(event: Event): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    const nextStyleId = (event.target as HTMLSelectElement).value as InputRichTextareaParagraphStyleId;
    const nextStyle = PARAGRAPH_STYLE_OPTIONS.find((option) => option.id === nextStyleId);

    if (!nextStyle || !this.focusEditorAndRestoreSelection()) {
      return;
    }

    this.executeNativeCommand('formatBlock', nextStyle.commandValue);
    this.syncValueFromEditor();
    this.refreshToolbarState();
  }

  protected onDocumentSelectionChange(): void {
    if (!this.isSelectionInsideEditor()) {
      if (!this.isFocused()) {
        this.activeToolbarActionIds.set([]);
        this.selectedParagraphStyleId.set('paragraph');
      }
      return;
    }

    this.captureSelectionRange();
    this.refreshToolbarState();
  }

  private mapToolbarActions(actions: InputRichTextareaToolbarAction[]): InputRichTextareaToolbarAction[] {
    const activeIds = this.activeToolbarActionIds();

    return actions.map((action) => ({
      ...action,
      active: activeIds.includes(action.id),
    }));
  }

  private getVisibleToolbarActions(
    actions: InputRichTextareaToolbarAction[],
  ): InputRichTextareaToolbarAction[] {
    return actions.filter((action) => this.isToolbarOptionEnabled(action.id));
  }

  private isToolbarOptionEnabled(actionId: InputRichTextareaToolbarActionId): boolean {
    return !!this.resolvedToolbarOptions()[actionId];
  }

  private focusEditorAndRestoreSelection(): boolean {
    const editor = this.editorElement()?.nativeElement;

    if (!editor) {
      return false;
    }

    editor.focus();

    if (this.restoreSavedSelection()) {
      return true;
    }

    this.moveCaretToEnd(editor);

    return true;
  }

  private syncEditorValue(nextValue: string): void {
    const editor = this.editorElement()?.nativeElement;

    if (!editor) {
      return;
    }

    const normalizedCurrentValue = this.normalizeHtml(editor.innerHTML);

    if (normalizedCurrentValue === nextValue) {
      if (nextValue.length === 0 && editor.innerHTML !== '') {
        editor.innerHTML = '';
      }
      return;
    }

    editor.innerHTML = nextValue;
  }

  private syncValueFromEditor(): void {
    const editor = this.editorElement()?.nativeElement;

    if (!editor) {
      return;
    }

    const nextValue = this.normalizeHtml(editor.innerHTML);

    if (nextValue.length === 0 && editor.innerHTML !== '') {
      editor.innerHTML = '';
    }

    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  private normalizeHtml(value: string): string {
    const template = this.documentRef.createElement('div');
    template.innerHTML = value;

    const textContent = (template.textContent ?? '').replace(/\u00a0/g, ' ').trim();
    const hasVisualContent = !!template.querySelector('img,video,iframe,table,hr,details');

    if (textContent.length === 0 && !hasVisualContent) {
      return '';
    }

    return template.innerHTML.trim();
  }

  private refreshToolbarState(): void {
    if (!this.isSelectionInsideEditor()) {
      this.activeToolbarActionIds.set([]);
      this.selectedParagraphStyleId.set('paragraph');
      return;
    }

    const nextActiveActionIds = new Set<InputRichTextareaToolbarActionId>();

    for (const action of [
      ...STRUCTURE_TOOLBAR_ACTIONS,
      ...TEXT_STYLE_TOOLBAR_ACTIONS,
      ...LIST_TOOLBAR_ACTIONS,
      ...ALIGNMENT_TOOLBAR_ACTIONS,
      ...LINK_TOOLBAR_ACTIONS,
    ]) {
      if (this.isToolbarActionActive(action)) {
        nextActiveActionIds.add(action.id);
      }
    }

    this.activeToolbarActionIds.set(Array.from(nextActiveActionIds));
    this.selectedParagraphStyleId.set(this.detectParagraphStyle());
  }

  private isToolbarActionActive(action: InputRichTextareaToolbarAction): boolean {
    if (action.id === 'collapse-block') {
      return !!this.findClosestSelectionElement('details');
    }

    if (action.id === 'link') {
      return !!this.findClosestSelectionElement('a');
    }

    if (!action.command || !TOOLBAR_ACTIONS_WITH_COMMAND_STATE.has(action.id)) {
      return false;
    }

    const queryCommandState = this.documentRef.queryCommandState?.bind(this.documentRef);

    if (!queryCommandState) {
      return false;
    }

    try {
      return queryCommandState(action.command);
    } catch {
      return false;
    }
  }

  private detectParagraphStyle(): InputRichTextareaParagraphStyleId {
    const selectionElement = this.findClosestSelectionElement('h1,h2,h3');
    const matchedOption = PARAGRAPH_STYLE_OPTIONS.find(
      (option) => option.tagName === selectionElement?.tagName,
    );

    return matchedOption?.id ?? 'paragraph';
  }

  private executeNativeCommand(command: string, value?: string): boolean {
    const execCommand = this.documentRef.execCommand?.bind(this.documentRef);

    if (!execCommand) {
      return false;
    }

    try {
      return execCommand(command, false, value);
    } catch {
      return false;
    }
  }

  private insertLink(): void {
    const promptFn = this.documentRef.defaultView?.prompt?.bind(this.documentRef.defaultView);

    if (!promptFn) {
      return;
    }

    const inputValue = promptFn('Ingresa la URL del enlace', 'https://');

    if (inputValue === null) {
      return;
    }

    const href = this.normalizeLinkUrl(inputValue);

    if (!href) {
      return;
    }

    this.focusEditorAndRestoreSelection();

    if (this.selectionHasText() && this.executeNativeCommand('createLink', href)) {
      return;
    }

    const selectedText = this.getSelectedText();
    const label = selectedText.length > 0 ? selectedText : href;

    this.insertHtml(`<a href="${this.escapeHtml(href)}">${this.escapeHtml(label)}</a>`);
  }

  private toggleCollapsibleBlock(): void {
    const currentDetailsElement = this.findClosestSelectionElement('details');

    if (currentDetailsElement instanceof HTMLDetailsElement) {
      currentDetailsElement.open = !currentDetailsElement.open;
      this.placeCaretAtEnd(currentDetailsElement);
      return;
    }

    const insertionTarget = this.getCurrentTopLevelNode();
    const promptFn = this.documentRef.defaultView?.prompt?.bind(this.documentRef.defaultView);
    const summaryText = promptFn ? promptFn('Titulo del bloque colapsable', 'Seccion') : 'Seccion';

    if (summaryText === null) {
      return;
    }

    const nextSummaryText = summaryText.trim().length > 0 ? summaryText.trim() : 'Seccion';

    const detailsElement = this.documentRef.createElement('details');
    detailsElement.open = true;

    const summaryElement = this.documentRef.createElement('summary');
    summaryElement.textContent = nextSummaryText;

    const paragraphElement = this.documentRef.createElement('p');
    paragraphElement.textContent = 'Contenido';

    detailsElement.append(summaryElement, paragraphElement);
    this.insertBlockAfterCurrentTopLevelNode(detailsElement, insertionTarget);
    this.placeCaretAtEnd(paragraphElement);
  }

  private insertBlockAfterCurrentTopLevelNode(
    blockElement: HTMLElement,
    topLevelElement: HTMLElement | null = this.getCurrentTopLevelNode(),
  ): void {
    const editor = this.editorElement()?.nativeElement;

    if (!editor) {
      return;
    }

    if (!topLevelElement || topLevelElement === editor) {
      editor.append(blockElement);
      return;
    }

    editor.insertBefore(blockElement, topLevelElement.nextSibling);
  }

  private getCurrentTopLevelNode(): HTMLElement | null {
    const editor = this.editorElement()?.nativeElement;
    const selectionElement = this.getSelectionElement();

    if (!editor || !selectionElement) {
      return null;
    }

    let currentElement: HTMLElement | null = selectionElement;

    while (currentElement && currentElement.parentElement && currentElement.parentElement !== editor) {
      currentElement = currentElement.parentElement;
    }

    return currentElement;
  }

  private insertHtml(html: string): void {
    if (this.executeNativeCommand('insertHTML', html)) {
      this.captureSelectionRange();
      return;
    }

    const editor = this.editorElement()?.nativeElement;
    const selection = this.documentRef.defaultView?.getSelection();
    const range = this.savedSelectionRange ?? (selection?.rangeCount ? selection.getRangeAt(0) : null);

    if (!editor) {
      return;
    }

    if (!range || !editor.contains(range.commonAncestorContainer)) {
      editor.insertAdjacentHTML('beforeend', html);
      this.moveCaretToEnd(editor);
      return;
    }

    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;

    range.deleteContents();
    range.insertNode(fragment);

    if (lastNode && selection) {
      const nextRange = this.documentRef.createRange();
      nextRange.setStartAfter(lastNode);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
      this.savedSelectionRange = nextRange.cloneRange();
    }
  }

  private captureSelectionRange(): void {
    const selection = this.documentRef.defaultView?.getSelection();

    if (!selection || selection.rangeCount === 0 || !this.isSelectionInsideEditor()) {
      return;
    }

    this.savedSelectionRange = selection.getRangeAt(0).cloneRange();
  }

  private restoreSavedSelection(): boolean {
    const selection = this.documentRef.defaultView?.getSelection();

    if (!selection || !this.savedSelectionRange) {
      return false;
    }

    try {
      selection.removeAllRanges();
      selection.addRange(this.savedSelectionRange);
      return true;
    } catch {
      return false;
    }
  }

  private getSelectedText(): string {
    return this.documentRef.defaultView?.getSelection()?.toString().trim() ?? '';
  }

  private selectionHasText(): boolean {
    return this.getSelectedText().length > 0;
  }

  private normalizeLinkUrl(value: string): string {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      return '';
    }

    const normalizedValue = trimmedValue.toLowerCase();

    if (normalizedValue.startsWith('javascript:') || normalizedValue.startsWith('data:')) {
      return '';
    }

    if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmedValue)) {
      return trimmedValue;
    }

    return `https://${trimmedValue}`;
  }

  private escapeHtml(value: string): string {
    const template = this.documentRef.createElement('div');
    template.textContent = value;
    return template.innerHTML;
  }

  private moveCaretToEnd(target: Node): void {
    const selection = this.documentRef.defaultView?.getSelection();

    if (!selection) {
      return;
    }

    const range = this.documentRef.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    this.savedSelectionRange = range.cloneRange();
  }

  private placeCaretAtEnd(target: Node): void {
    this.moveCaretToEnd(target);
  }

  private findClosestSelectionElement(selector: string): HTMLElement | null {
    const selectionElement = this.getSelectionElement();
    return selectionElement?.closest(selector) as HTMLElement | null;
  }

  private getSelectionElement(): HTMLElement | null {
    const anchorNode = this.documentRef.defaultView?.getSelection()?.anchorNode;

    if (!anchorNode) {
      return null;
    }

    if (anchorNode instanceof HTMLElement) {
      return anchorNode;
    }

    return anchorNode.parentElement;
  }

  private isSelectionInsideEditor(): boolean {
    const editor = this.editorElement()?.nativeElement;
    const anchorNode = this.documentRef.defaultView?.getSelection()?.anchorNode;

    if (!editor || !anchorNode) {
      return false;
    }

    return editor.contains(anchorNode);
  }
}
