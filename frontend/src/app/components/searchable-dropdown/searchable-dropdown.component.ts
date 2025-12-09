import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SearchableDropdownComponent,
      multi: true
    }
  ]
})
export class SearchableDropdownComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() options: string[] = [];
  @Input() placeholder: string = 'Select...';
  @Input() searchPlaceholder: string = 'Search...';
  @Input() allOptionLabel: string = 'All';
  @Input() showAllOption: boolean = true;
  @Input() iconClass: string = 'fa-filter';
  @Input() width: string = 'auto';
  @Input() allOptionValue: string = 'All';
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'large' = 'small';
  
  @Output() valueChange = new EventEmitter<string>();
  
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  @ViewChild('dropdown', { static: false }) dropdown!: ElementRef;
  
  selectedValue: string = '';
  searchTerm: string = '';
  isOpen: boolean = false;
  filteredOptions: string[] = [];
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && this.options) {
      this.filterOptions();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchTerm = '';
      this.filterOptions();
    }
  }

  filterOptions() {
    if (!this.searchTerm.trim()) {
      this.filteredOptions = [...this.options];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredOptions = this.options.filter(option => 
        option.toLowerCase().includes(search)
      );
    }
  }

  onSearchChange() {
    this.filterOptions();
  }

  selectOption(option: string) {
    const value = option === this.allOptionLabel ? this.allOptionValue : option;
    this.selectedValue = value;
    this.isOpen = false;
    this.searchTerm = '';
    this.filterOptions();
    this.onChange(value);
    this.valueChange.emit(value);
    this.onTouched();
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.searchInput) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }

  getDisplayValue(): string {
    if (!this.selectedValue || this.selectedValue === '' || this.selectedValue === this.allOptionValue) {
      return this.placeholder;
    }
    return this.selectedValue;
  }
  
  isSelected(option: string): boolean {
    if (option === this.allOptionLabel) {
      return !this.selectedValue || this.selectedValue === '' || this.selectedValue === this.allOptionValue;
    }
    return this.selectedValue === option;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.selectedValue = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}

