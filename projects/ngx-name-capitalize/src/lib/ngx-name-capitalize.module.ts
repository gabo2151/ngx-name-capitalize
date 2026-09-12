import { NgModule } from '@angular/core';

import { NameCapitalizePipe } from './name-capitalize.pipe';

/**
 * Re-exports {@link NameCapitalizePipe} for NgModule-based applications.
 *
 * Standalone components should import the pipe directly instead:
 * `imports: [NameCapitalizePipe]`.
 */
@NgModule({
  imports: [NameCapitalizePipe],
  exports: [NameCapitalizePipe],
})
export class NgxNameCapitalizeModule {}
