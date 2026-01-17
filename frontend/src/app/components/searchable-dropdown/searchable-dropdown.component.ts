/**
 * Searchable Dropdown Component
 * 
 * Purpose: A reusable dropdown component with search functionality
 * Features:
 * - Real-time search filtering
 * - Single or multiple selection modes
 * - "All" option support for clearing selections
 * - Keyboard navigation support
 * - Click-outside-to-close behavior
 * - Customizable icons, placeholders, and size
 * - Integrates with Angular Reactive Forms (ControlValueAccessor)
 * 
 * Usage Examples:
 * 
 * Single Selection:
 * <app-searchable-dropdown
 *   [options]="['Option 1', 'Option 2', 'Option 3']"
 *   placeholder="Select an option"
 *   (valueChange)="onSelectionChange($event)">
 * </app-searchable-dropdown>
 * 
 * Multiple Selection:
 * <app-searchable-dropdown
 *   [options]="skillNames"
 *   [multiple]="true"
 *   placeholder="Select skills"
 *   [(ngModel)]="selectedSkills">
 * </app-searchable-dropdown>
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.css'],
  providers: [
    {
      // Allows this component to work with Angular forms (ngModel, formControl)
      provide: NG_VALUE_ACCESSOR,
      useExisting: SearchableDropdownComponent,
      multi: true
    }
  ]
})
export class SearchableDropdownComponent implements OnInit, OnChanges, ControlValueAccessor {
  // --- Input Properties (Configurable by Parent Component) ---
  
  /** Array of options to display in the dropdown */
  @Input() options: string[] = [];
  
  /** Placeholder text shown when nothing is selected */
  @Input() placeholder: string = 'Select...';
  
  /** Placeholder for the search input field */
  @Input() searchPlaceholder: string = 'Search...';
  
  /** Label for the "All" option (shown when showAllOption is true) */
  @Input() allOptionLabel: string = 'All';
  
  /** Whether to show the "All" option at the top of the dropdown */
  @Input() showAllOption: boolean = true;
  
  /** Font Awesome icon class for the dropdown button (e.g., 'fa-filter') */
  @Input() iconClass: string = 'fa-filter';
  
  /** CSS width for the dropdown (e.g., '200px', 'auto') */
  @Input() width: string = 'auto';
  
  /** Value emitted when "All" option is selected */
  @Input() allOptionValue: string = 'All';
  
  /** Whether the dropdown is disabled */
  @Input() disabled: boolean = false;
  
  /** Visual size of the dropdown: 'small' or 'large' */
  @Input() size: 'small' | 'large' = 'small';
  
  /** Whether to allow multiple selections (checkbox mode) */
  @Input() multiple: boolean = false;
  
  // --- Output Events ---
  
  /** Emits the selected value(s) when selection changes */
  @Output() valueChange = new EventEmitter<string | string[]>();
  
  // --- View References ---
  
  /** Reference to the search input element for focus management */
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  
  /** Reference to the dropdown container for click-outside detection */
  @ViewChild('dropdown', { static: false }) dropdown!: ElementRef;
  
  // --- Component State ---
  
  /** Currently selected value (for single selection mode) */
  selectedValue: string = '';
  
  /** Currently selected values (for multiple selection mode) */
  selectedValues: string[] = [];
  
  /** Current search term entered by user */
  searchTerm: string = '';
  
  /** Whether the dropdown is currently open */
  isOpen: boolean = false;
  
  /** Filtered list of options based on search term */
  filteredOptions: string[] = [];
  
  // --- ControlValueAccessor Methods (for Angular Forms integration) ---
  
  /** Callback function for form value changes (called when user selects an option) */
  private onChange = (value: any) => {};
  
  /** Callback function for form touched state (called when dropdown loses focus) */
  private onTouched = () => {};

  /**
   * Angular lifecycle hook - initializes component on load
   * Sets up the initial filtered options list from input options
   */
  ngOnInit() {
    this.filteredOptions = [...this.options];
  }

  /**
   * Angular lifecycle hook - responds to input property changes
   * Re-filters options when the options array is updated by parent component
   * @param changes - Object containing all changed input properties
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && this.options) {
      this.filterOptions();
    }
  }

  /**
   * Document-wide click event listener
   * Closes the dropdown when user clicks outside of it
   * @param event - DOM click event
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchTerm = '';
      this.filterOptions();
    }
  }

  /**
   * Filters the options list based on current search term
   * - If search term is empty, shows all options
   * - Otherwise, filters options containing the search term (case-insensitive)
   */
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

  /**
   * Called when user types in the search input
   * Triggers real-time filtering of options
   */
  onSearchChange() {
    this.filterOptions();
  }

  /**
   * Handles user selection of an option
   * Behavior differs based on single vs. multiple selection mode:
   * 
   * Single Selection Mode:
   * - Sets the selected value
   * - Closes the dropdown
   * - Emits the new value to parent and form
   * 
   * Multiple Selection Mode:
   * - Toggles the selected option (adds/removes from array)
   * - "All" option clears all selections
   * - Keeps dropdown open for additional selections
   * - Emits array of selected values
   * 
   * @param option - The option text that was clicked
   */
  selectOption(option: string) {
    if (this.multiple) {
      if (option === this.allOptionLabel) {
        // Clear selection to represent "All"
        this.selectedValues = [];
      } else {
        this.toggleOption(option);
      }
      // Notify form and parent component of changes
      this.onChange([...this.selectedValues]);
      this.valueChange.emit([...this.selectedValues]);
      this.onTouched();
    } else {
      // Map "All" label to configured value, otherwise use option as-is
      const value = option === this.allOptionLabel ? this.allOptionValue : option;
      this.selectedValue = value;
      this.isOpen = false;
      this.searchTerm = '';
      this.filterOptions();
      // Notify form and parent component of changes
      this.onChange(value);
      this.valueChange.emit(value);
      this.onTouched();
    }
  }

  toggleOption(option: string) {
    const idx = this.selectedValues.indexOf(option);
    if (idx >= 0) {
      this.selectedValues.splice(idx, 1);
    } else {
      this.selectedValues.push(option);
    }
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
    if (this.multiple) {
      if (!this.selectedValues || this.selectedValues.length === 0) return this.placeholder;
      if (this.selectedValues.length <= 2) return this.selectedValues.join(', ');
      const [a, b] = this.selectedValues;
      return `${a}, ${b} +${this.selectedValues.length - 2}`;
    } else {
      if (!this.selectedValue || this.selectedValue === '' || this.selectedValue === this.allOptionValue) {
        return this.placeholder;
      }
      return this.selectedValue;
    }
  }
  
  isSelected(option: string): boolean {
    if (this.multiple) {
      if (option === this.allOptionLabel) {
        return !this.selectedValues || this.selectedValues.length === 0;
      }
      return this.selectedValues.includes(option);
    } else {
      if (option === this.allOptionLabel) {
        return !this.selectedValue || this.selectedValue === '' || this.selectedValue === this.allOptionValue;
      }
      return this.selectedValue === option;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (this.multiple) {
      this.selectedValues = Array.isArray(value) ? [...value] : [];
    } else {
      this.selectedValue = (value as string) || '';
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}

