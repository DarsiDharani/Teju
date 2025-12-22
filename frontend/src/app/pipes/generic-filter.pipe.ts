/**
 * Generic Filter Pipe
 * 
 * Purpose: Filters arrays based on search text across multiple fields
 * Features:
 * - Case-insensitive search filtering
 * - Search across multiple specified fields
 * - Handles null/undefined input gracefully
 * 
 * Usage in template:
 * {{ items | filter:searchText:['field1', 'field2', 'field3'] }}
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class GenericFilterPipe implements PipeTransform {
  /**
   * Transforms an array by applying search filter across specified fields
   * @param items - Array of objects to filter
   * @param searchText - Search text to match (case-insensitive)
   * @param fields - Array of field names to search in
   * @returns Filtered array
   */
  transform(items: any[], searchText: string = '', fields: string[] = []): any[] {
    if (!items || !items.length) return [];
    if (!searchText || !searchText.trim()) return items;
    
    const search = searchText.toLowerCase().trim();
    
    return items.filter(item => {
      // If no fields specified, search all string properties
      if (!fields || fields.length === 0) {
        return Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(search)
        );
      }
      
      // Search in specified fields only
      return fields.some(field => {
        const value = this.getNestedProperty(item, field);
        return value && value.toString().toLowerCase().includes(search);
      });
    });
  }
  
  /**
   * Helper to get nested property values (e.g., 'user.name')
   */
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => 
      current ? current[prop] : null, obj
    );
  }
}
