import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Select } from './select';
import { SelectOption } from './select.types';

describe('Select', () => {
  let component: Select;
  let fixture: ComponentFixture<Select>;
  let trigger: HTMLButtonElement;

  const options: SelectOption[] = [
    { label: 'Electronica', value: 'electronics' },
    { label: 'Audio', value: 'audio' },
    { label: 'Ropa', value: 'fashion', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Select],
    }).compileComponents();

    fixture = TestBed.createComponent(Select);
    fixture.componentRef.setInput('options', options);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    trigger = fixture.nativeElement.querySelector('button[role="combobox"]') as HTMLButtonElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default trigger classes and render the placeholder', () => {
    const dropdown = fixture.nativeElement.querySelector(
      'button[role="combobox"] + div',
    ) as HTMLDivElement;

    expect(trigger.className).toContain('h-10');
    expect(trigger.className).toContain('border-border');
    expect(trigger.className).toContain('bg-background');
    expect(dropdown.className).toContain('h-0');
    expect(trigger.textContent).toContain('Selecciona una opcion');
  });

  it('should render the placeholder option label when configured', async () => {
    fixture.componentRef.setInput('showPlaceholderOption', true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger.textContent).toContain('Selecciona una opcion');
    expect(component.model()?.value).toBeNull();
  });

  it('should open the dropdown and select an option', () => {
    const dropdown = fixture.nativeElement.querySelector(
      'button[role="combobox"] + div',
    ) as HTMLDivElement;

    trigger.click();
    fixture.detectChanges();

    expect(dropdown.className).toContain('h-auto');
    expect(dropdown.className).not.toContain('h-0');

    const optionButtons = fixture.nativeElement.querySelectorAll(
      'button[role="option"]',
    ) as NodeListOf<HTMLButtonElement>;

    optionButtons[1].click();
    fixture.detectChanges();

    expect(component.model()).toEqual(options[1]);
    expect(component.value()).toBe('audio');
    expect(component.open()).toBe(false);
    expect(trigger.textContent).toContain('Audio');
  });

  it('should not open when disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();

    expect(component.open()).toBe(false);
  });

  it('should filter options when searchable is enabled', async () => {
    fixture.componentRef.setInput('searchable', true);
    await fixture.whenStable();
    fixture.detectChanges();

    trigger.click();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    searchInput.value = 'audio';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const optionButtons = fixture.nativeElement.querySelectorAll(
      'button[role="option"]',
    ) as NodeListOf<HTMLButtonElement>;

    expect(optionButtons).toHaveLength(1);
    expect(optionButtons[0].textContent).toContain('Audio');
  });

  it('should sync the selected option when the form value changes externally', async () => {
    fixture.componentRef.setInput('value', 'electronics');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.model()).toEqual(options[0]);
    expect(trigger.textContent).toContain('Electronica');
  });

  it('should ignore disabled options', () => {
    trigger.click();
    fixture.detectChanges();

    const optionButtons = fixture.nativeElement.querySelectorAll(
      'button[role="option"]',
    ) as NodeListOf<HTMLButtonElement>;

    optionButtons[2].click();
    fixture.detectChanges();

    expect(component.model()).toBeNull();
    expect(component.value()).toBeNull();
  });
});
