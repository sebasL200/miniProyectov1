import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { afterEach, vi } from 'vitest';

import { InputRichTextarea } from './input-rich-textarea';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputRichTextarea],
  template: `
    <form [formGroup]="form">
      <ecom-input-rich-textarea formControlName="value" />
    </form>
  `,
})
class InputRichTextareaReactiveHost {
  readonly form = new FormGroup({
    value: new FormControl('<p>Initial rich value</p>', { nonNullable: true }),
  });
}

describe('InputRichTextarea', () => {
  let component: InputRichTextarea;
  let fixture: ComponentFixture<InputRichTextarea>;
  let editor: HTMLDivElement;
  let originalExecCommand: typeof document.execCommand | undefined;

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalExecCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: originalExecCommand,
        configurable: true,
      });
      return;
    }

    Reflect.deleteProperty(document, 'execCommand');
  });

  beforeEach(async () => {
    originalExecCommand = document.execCommand;

    await TestBed.configureTestingModule({
      imports: [InputRichTextarea, InputRichTextareaReactiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(InputRichTextarea);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    editor = fixture.nativeElement.querySelector('[role="textbox"]') as HTMLDivElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default rich textarea structure', () => {
    const toolbarButtons = fixture.nativeElement.querySelectorAll('ecom-toolbar-button');
    const paragraphStyleSelect = fixture.nativeElement.querySelector('select');
    const placeholder = fixture.nativeElement.textContent;

    expect(toolbarButtons.length).toBe(4);
    expect(paragraphStyleSelect).toBeNull();
    expect(editor.className).toContain('min-h-32');
    expect(placeholder).toContain('Write rich text here...');
    expect(
      fixture.nativeElement.querySelector('button[title="Negrita"]') as HTMLButtonElement | null,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        'button[title="Subrayado"]',
      ) as HTMLButtonElement | null,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        'button[title="Aumentar sangria"]',
      ) as HTMLButtonElement | null,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        'button[title="Lista con vinetas"]',
      ) as HTMLButtonElement | null,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('button[title="Cursiva"]') as HTMLButtonElement | null,
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        'button[title="Insertar enlace"]',
      ) as HTMLButtonElement | null,
    ).toBeNull();
  });

  it('should render only the configured toolbar options when toolbarOptions is provided', async () => {
    fixture.componentRef.setInput('toolbarOptions', {
      'paragraph-style': true,
      italic: true,
      'ordered-list': true,
      link: true,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const toolbarButtons = fixture.nativeElement.querySelectorAll('ecom-toolbar-button');
    const paragraphStyleSelect = fixture.nativeElement.querySelector('select');

    expect(toolbarButtons.length).toBe(3);
    expect(paragraphStyleSelect).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('button[title="Cursiva"]') as HTMLButtonElement | null,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        'button[title="Lista numerada"]',
      ) as HTMLButtonElement | null,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        'button[title="Insertar enlace"]',
      ) as HTMLButtonElement | null,
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('button[title="Negrita"]') as HTMLButtonElement | null,
    ).toBeNull();
  });

  it('should update the editor classes when the size changes', async () => {
    fixture.componentRef.setInput('size', 'xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(editor.className).toContain('min-h-40');
    expect(editor.className).toContain('text-xl');
    expect(editor.className).not.toContain('min-h-32');
  });

  it('should merge custom classes into the wrapper element', async () => {
    fixture.componentRef.setInput('class', 'rounded-xl');
    await fixture.whenStable();
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.firstElementChild as HTMLDivElement;

    expect(wrapper.className).toContain('rounded-xl');
    expect(wrapper.className).not.toContain('rounded-sm');
  });

  it('should update the model value on editor input events', () => {
    editor.innerHTML = '<p>Updated rich value</p>';
    editor.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('<p>Updated rich value</p>');
  });

  it('should execute toolbar commands', () => {
    const execCommandSpy = vi.fn(() => true);

    Object.defineProperty(document, 'execCommand', {
      value: execCommandSpy,
      configurable: true,
    });

    const boldToolbarButton = fixture.nativeElement.querySelector(
      'button[title="Negrita"]',
    ) as HTMLButtonElement;

    boldToolbarButton.click();

    expect(execCommandSpy).toHaveBeenCalledWith('bold', false, undefined);
  });

  it('should execute paragraph style commands from the toolbar select', async () => {
    const execCommandSpy = vi.fn(() => true);

    Object.defineProperty(document, 'execCommand', {
      value: execCommandSpy,
      configurable: true,
    });

    fixture.componentRef.setInput('toolbarOptions', { 'paragraph-style': true });
    await fixture.whenStable();
    fixture.detectChanges();

    const paragraphStyleSelect = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    paragraphStyleSelect.value = 'heading-1';
    paragraphStyleSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(execCommandSpy).toHaveBeenCalledWith('formatBlock', false, '<h1>');
  });

  it('should create links from the selected text', async () => {
    const execCommandSpy = vi.fn(() => true);
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('example.com');

    Object.defineProperty(document, 'execCommand', {
      value: execCommandSpy,
      configurable: true,
    });

    fixture.componentRef.setInput('toolbarOptions', { link: true });
    await fixture.whenStable();
    fixture.detectChanges();

    editor.innerHTML = '<p>Catalogo</p>';
    selectEditorText('Catalogo');

    const linkToolbarButton = fixture.nativeElement.querySelector(
      'button[title="Insertar enlace"]',
    ) as HTMLButtonElement;

    linkToolbarButton.click();

    expect(promptSpy).toHaveBeenCalledOnce();
    expect(execCommandSpy).toHaveBeenCalledWith('createLink', false, 'https://example.com');
  });

  it('should insert a collapsible block after the current block', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Especificaciones');

    fixture.componentRef.setInput('toolbarOptions', { 'collapse-block': true });
    await fixture.whenStable();
    fixture.detectChanges();

    editor.innerHTML = '<p>Base</p>';
    placeCaretInEditorText('Base', 4);

    const collapseToolbarButton = fixture.nativeElement.querySelector(
      'button[title="Colapsar/Expandir bloque"]',
    ) as HTMLButtonElement;

    collapseToolbarButton.click();
    fixture.detectChanges();

    const detailsElement = editor.querySelector('details') as HTMLDetailsElement | null;

    expect(detailsElement).toBeTruthy();
    expect(detailsElement?.open).toBe(true);
    expect(detailsElement?.querySelector('summary')?.textContent).toBe('Especificaciones');
    expect(component.value()).toContain('<details open=""><summary>Especificaciones</summary>');
  });

  it('should work with formControlName', async () => {
    const hostFixture = TestBed.createComponent(InputRichTextareaReactiveHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();
    hostFixture.detectChanges();

    const hostComponent = hostFixture.componentInstance;
    const hostEditor = hostFixture.nativeElement.querySelector(
      '[role="textbox"]',
    ) as HTMLDivElement;
    const hostToolbarButton = hostFixture.nativeElement.querySelector(
      'ecom-toolbar-button button',
    ) as HTMLButtonElement;

    expect(hostEditor.innerHTML).toBe('<p>Initial rich value</p>');

    hostEditor.innerHTML = '<p>Updated from UI</p>';
    hostEditor.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();

    expect(hostComponent.form.controls.value.value).toBe('<p>Updated from UI</p>');

    hostComponent.form.controls.value.setValue('<p>Updated from control</p>');
    hostFixture.detectChanges();

    expect(hostEditor.innerHTML).toBe('<p>Updated from control</p>');

    hostComponent.form.controls.value.disable();
    hostFixture.detectChanges();

    expect(hostEditor.getAttribute('contenteditable')).toBe('false');
    expect(hostToolbarButton.disabled).toBe(true);
  });

  function selectEditorText(text: string): void {
    const textNode = editor.querySelector('p')?.firstChild;

    if (!textNode?.textContent) {
      throw new Error('Expected editor text node');
    }

    const textStartIndex = textNode.textContent.indexOf(text);
    const range = document.createRange();
    const selection = window.getSelection();

    range.setStart(textNode, textStartIndex);
    range.setEnd(textNode, textStartIndex + text.length);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    fixture.detectChanges();
  }

  function placeCaretInEditorText(text: string, offset: number): void {
    const textNode = editor.querySelector('p')?.firstChild;

    if (!textNode?.textContent) {
      throw new Error('Expected editor text node');
    }

    const textStartIndex = textNode.textContent.indexOf(text);
    const range = document.createRange();
    const selection = window.getSelection();

    range.setStart(textNode, textStartIndex + offset);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event('selectionchange'));
    fixture.detectChanges();
  }
});
