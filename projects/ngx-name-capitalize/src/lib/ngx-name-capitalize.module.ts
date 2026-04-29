import { NgModule } from '@angular/core';

import { NameCapitalizePipe } from './name-capitalize.pipe';


@NgModule({
  declarations: [NameCapitalizePipe],
  exports: [NameCapitalizePipe],
})
export class NgxNameCapitalizeModule {}
