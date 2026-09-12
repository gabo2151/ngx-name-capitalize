import { NgModule } from '@angular/core';

import { NameCapitalizePipe } from './name-capitalize.pipe';

/**
 * Declares and exports {@link NameCapitalizePipe}.
 *
 * On this line the module is the only way to use the pipe: Angular 12 and 13 have no
 * standalone pipes. The 2.x and 3.x lines also let you import the pipe directly.
 */
@NgModule({
  declarations: [NameCapitalizePipe],
  exports: [NameCapitalizePipe],
})
export class NgxNameCapitalizeModule {}
