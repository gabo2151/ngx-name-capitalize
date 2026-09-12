import { Pipe, PipeTransform } from '@angular/core';
import { capitalizeName, NameCapitalizeOptions } from 'name-capitalize';

/**
 * Capitalizes a person's name, keeping particles (`de`, `van`, `von`…) lowercase
 * and handling hyphens, apostrophes and Unicode separators.
 *
 * @example
 * ```html
 * {{ 'JUAN DE LA MAZA' | namecase }}
 * <!-- Juan de la Maza -->
 *
 * {{ 'ronald mcdonald' | namecase:{ mcPrefix: true } }}
 * <!-- Ronald McDonald -->
 * ```
 */
// Angular 12 has no standalone pipes, so this one is declared by
// NgxNameCapitalizeModule. The 2.x and 3.x lines make it standalone; that is the
// only difference between this file and theirs.
@Pipe({
  name: 'namecase',
})
export class NameCapitalizePipe implements PipeTransform {
  /**
   * `null` and `undefined` are accepted because template expressions are full of
   * them (`user?.name`, `control.value`, the `async` pipe). Under `strictTemplates`
   * a `string`-only signature would reject those without the caller ever having a
   * runtime problem.
   *
   * @param value - Name to format. Nullish yields `''`, or throws under `strict`.
   * @param options - Forwarded verbatim to `capitalizeName`.
   * @throws {TypeError} If `value` is not a string and `options.strict` is enabled.
   */
  transform(value: string | null | undefined, options?: NameCapitalizeOptions): string {
    // Delegated rather than guarded. An `if (!value) return ''` here would swallow
    // nullish input before the engine ever sees it, silently defeating `strict`,
    // whose entire purpose is to throw instead of turning missing data into ''.
    //
    // `strict` is pinned instead of left to the engine's default: name-capitalize
    // has announced that its default flips to `true` in a future major. Since the
    // engine is a peer dependency with an open range, that release would otherwise
    // reach apps on its own and make `{{ user?.name | namecase }}` throw mid-render.
    // A caller's own `strict` still wins — their options spread last.
    return capitalizeName(value, { strict: false, ...options });
  }
}
