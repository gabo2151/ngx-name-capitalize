import { Pipe, PipeTransform } from '@angular/core';
import { capitalizeName } from 'name-capitalize';


@Pipe({
  name: 'namecase',
  standalone: true,
})
export class NameCapitalizePipe implements PipeTransform {

  transform(value: string): unknown {
    return capitalizeName(value);
  }

}
