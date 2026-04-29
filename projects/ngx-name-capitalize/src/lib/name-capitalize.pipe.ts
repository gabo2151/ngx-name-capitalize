import { Pipe, PipeTransform } from '@angular/core';
import { capitalizeName } from 'name-capitalize';


@Pipe({
  name: 'namecase',
})
export class NameCapitalizePipe implements PipeTransform {

  transform(value: string): unknown {
    return capitalizeName(value);
  }

}
