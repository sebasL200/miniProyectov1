import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputSelect } from './input-select';
import { InputSelectOption } from './input-select.types';

describe('InputSelect', () => {
  let component: InputSelect;
  let fixture: ComponentFixture<InputSelect>;
  let trigger: HTMLButtonElement;

  const options: InputSelectOption[] = [
    { label: 'Electronica', value: 'electronics' },
    { label: 'Audio', value: 'audio' },
    { label: 'Ropa', value: 'fashion', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(InputSelect);
    fixture.componentRef.setInput('options', options);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    trigger = fixture.nativeElement.querySelector('button[role="combobox"]') as HTMLButtonElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default trigger classes and render the empty label', () => {
    const dropdown = fixture.nativeElement.querySelector(
      'button[role="combobox"] + div',
    ) as HTMLDivElement;

    expect(trigger.className).toContain('h-10');
    expect(trigger.className).toContain('border-border');
    expect(trigger.className).toContain('bg-background');
    expect(dropdown.className).toContain('h-0');
    expect(trigger.textContent).toContain('--------------');
  });

  it('should apply the same xl size scale as the text inputs', async () => {
    fixture.componentRef.setInput('size', 'xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger.className).toContain('h-12');
    expect(trigger.className).toContain('text-xl');
    expect(trigger.className).not.toContain('h-10');
  });

  it('should render the default option label when configured', async () => {
    fixture.componentRef.setInput('showDefaultOption', true);
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

  it('should keep selected object chips visible when the selected value is not in options', async () => {
    const selectedAttribute = {
      id: 'attribute-1',
      name: 'Material',
      slug: 'material',
    };

    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('options', []);
    component.writeValue([selectedAttribute]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger.textContent).toContain('Material');
  });

  it('should match selected object chips by id when options use a different object instance', async () => {
    const selectedAttribute = {
      id: 'attribute-1',
      name: 'Material',
      slug: 'material',
    };
    const optionAttribute = {
      id: 'attribute-1',
      name: 'Material',
      slug: 'material',
    };

    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('options', [
      { label: 'Material', value: optionAttribute },
    ]);
    component.writeValue([selectedAttribute]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(trigger.textContent).toContain('Material');
    expect(component.selectedOptions()).toEqual([
      { label: 'Material', value: optionAttribute },
    ]);
  });

  it('should sync the form value when the selected option changes externally', async () => {
    fixture.componentRef.setInput('model', options[1]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.value()).toBe('audio');
    expect(trigger.textContent).toContain('Audio');
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

  it('should keep disabled selected chips when removing or clearing selections', async () => {
    fixture.componentRef.setInput('multiple', true);
    component.writeValue(['fashion', 'audio']);
    await fixture.whenStable();
    fixture.detectChanges();

    component.onRemoveChip(new MouseEvent('click'), options[2]);

    expect(component.value()).toEqual(['fashion', 'audio']);

    component.onClearAll();

    expect(component.value()).toEqual(['fashion']);
  });
});
