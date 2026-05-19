import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nestedValue',
})
export class NestedValuePipe implements PipeTransform {
  transform(obj: any, path: string): any {
    if (!obj || !path) {
      return null;
    }
    const properties = path.split('.');
    let currentValue = obj;
    for (const prop of properties) {
      if (currentValue && prop in currentValue) {
        currentValue = currentValue[prop];
      } else {
        return null;
      }
    }
    return currentValue;
  }
}
