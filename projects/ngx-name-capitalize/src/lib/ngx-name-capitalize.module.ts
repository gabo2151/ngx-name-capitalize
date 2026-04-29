import { NgModule } from '@angular/core';

import { NameCapitalizePipe } from './name-capitalize.pipe';


@NgModule({
  imports: [NameCapitalizePipe],
  exports: [NameCapitalizePipe],
})
export class NgxNameCapitalizeModule {}
