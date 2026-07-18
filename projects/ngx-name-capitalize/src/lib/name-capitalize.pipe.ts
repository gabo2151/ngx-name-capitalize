import { Pipe, PipeTransform } from '@angular/core';
import { capitalizeName, NameCapitalizeOptions } from 'name-capitalize';


@Pipe({
  name: 'namecase',
  standalone: true,
})
export class NameCapitalizePipe implements PipeTransform {

  transform(value: string, options?: NameCapitalizeOptions): string {
    if (!value) {
      return '';
    }
    return capitalizeName(value, options);
  }

}
