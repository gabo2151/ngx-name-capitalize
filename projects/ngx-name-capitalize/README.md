# ngx-name-capitalize (Angular 12 – 13)

[![npm version](https://img.shields.io/npm/v/ngx-name-capitalize/legacy-v1)](https://www.npmjs.org/package/ngx-name-capitalize)
[![install size](https://packagephobia.com/badge?p=ngx-name-capitalize@legacy-v1)](https://packagephobia.com/result?p=ngx-name-capitalize@legacy-v1)
[![npm downloads](https://img.shields.io/npm/dm/ngx-name-capitalize)](https://npm-stat.com/charts.html?package=ngx-name-capitalize)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Angular pipe for smart capitalization of person names. Handles compound surnames, particles (de, del, la, van, von…), hyphenated names, apostrophes, and Unicode characters.

Built on top of [name-capitalize](https://www.npmjs.com/package/name-capitalize).

> **This is the `1.x` line, for Angular 12 and 13.** It is published under the
> `legacy-v1` npm tag, so `npm install ngx-name-capitalize` (which resolves `latest`)
> will **not** give you this version. See the install command below.

## Compatibility

| ngx-name-capitalize | Angular | npm tag | Status |
| --- | --- | --- | --- |
| 3.x | 16 and above | `latest` | Active |
| 2.x | 14 – 15 | `legacy-v2` | Maintenance |
| **1.x** | **12 – 13** | **`legacy-v1`** | **Maintenance — this branch** |

A major of this package means **one thing only: the minimum supported Angular version
went up**. It is not an API break. All three lines carry the same library source; this
one differs only in that Angular 12 and 13 have no standalone pipes, so the pipe is
used through `NgxNameCapitalizeModule`.

Every release on this branch is linked against Angular 12 and 13 in CI
([`scripts/verify-angular-compat.mjs`](scripts/verify-angular-compat.mjs)), so the table
above is verified rather than claimed.

## Installation

```bash
npm install ngx-name-capitalize@legacy-v1
```

> **Coming from 1.2.0 or earlier?** Those versions declared `peerDependencies` of
> `^12.2.0`, which npm reads as "12 and nothing else" — so installing them in an
> **Angular 13** project failed with `ERESOLVE`, even though this line has always
> supported 13. 1.3.0 fixes the range to `>=12.2.0 <14.0.0`. No code change was needed.

`name-capitalize` is a peer dependency and is installed automatically by npm 7+. This
line pins it to the `1.x` engine (`>=1.4.0 <2.0.0`): `name-capitalize` 2.x requires
Node 18, while this branch exists for toolchains on Node 16.

## Usage

```typescript
import { NgxNameCapitalizeModule } from 'ngx-name-capitalize';

@NgModule({
  imports: [NgxNameCapitalizeModule]
})
export class AppModule { }
```

Standalone pipes arrived in Angular 14. If your app is on 14 or later, use the
[`2.x`](https://www.npmjs.com/package/ngx-name-capitalize/v/legacy-v2) or
[`3.x`](https://www.npmjs.com/package/ngx-name-capitalize) line instead, where
`NameCapitalizePipe` can also be imported directly.

### In your template

```html
{{ 'JUAN DE LA MAZA' | namecase }}
<!-- Output: Juan de la Maza -->

{{ "bernardo o'higgins riquelme" | namecase }}
<!-- Output: Bernardo O'Higgins Riquelme -->

{{ 'jean-pierre dupont' | namecase }}
<!-- Output: Jean-Pierre Dupont -->
```

Nullish values are accepted and render as an empty string, so `strictTemplates` is happy
with the values templates actually carry:

```html
{{ user?.name | namecase }}          <!-- string | null | undefined -->
{{ form.value.name | namecase }}
{{ name$ | async | namecase }}
```

### In your component

```typescript
import { NameCapitalizePipe } from 'ngx-name-capitalize';

@Component({
  providers: [NameCapitalizePipe]
})
export class MyComponent {
  constructor(private namecase: NameCapitalizePipe) {}

  format(name: string): string {
    return this.namecase.transform(name);
  }
}
```

## Options

The pipe forwards an optional `NameCapitalizeOptions` object to
[name-capitalize](https://www.npmjs.com/package/name-capitalize):

```html
{{ 'ronald mcdonald' | namecase:{ mcPrefix: true } }}
<!-- Output: Ronald McDonald -->

{{ 'dick van dyke' | namecase:{ ignoreParticles: ['van'] } }}
<!-- Output: Dick Van Dyke -->
```

| Option | Type | Description |
| --- | --- | --- |
| `particles` | `readonly string[] \| ReadonlySet<string>` | Replace the built-in particle list entirely. |
| `extraParticles` | `readonly string[] \| ReadonlySet<string>` | Add particles on top of the built-in list. |
| `ignoreParticles` | `readonly string[] \| ReadonlySet<string>` | Remove particles from the built-in list. |
| `mcPrefix` | `boolean` | Capitalize the letter after `Mc` (`mcdonald` → `McDonald`). Default `false`. |
| `particlesAfterHyphen` | `boolean` | Apply particle rules after a hyphen too. Default `false`. |
| `strict` | `boolean` | Throw a `TypeError` on non-string input instead of returning `''`. Default `false`. |

The `NameCapitalizeOptions` type is re-exported for use in your components:

```typescript
import { NameCapitalizeOptions } from 'ngx-name-capitalize';
```

Object literals written directly in a template are memoized by Angular, so the pipe stays
pure and does not recompute on every change detection cycle. If you build the options
object in code, hold it in a field rather than returning a fresh object from a getter.

### Missing values and `strict`

By default a missing name renders as an empty string — the right behavior for a template:

```html
{{ user?.name | namecase }}   <!-- null → '' -->
```

Pass `strict` when a missing name is a bug you want to hear about rather than a blank
space, for example while formatting data you are about to persist:

```html
{{ record.name | namecase:{ strict: true } }}
<!-- throws TypeError if record.name is not a string -->
```

The pipe pins `strict` to `false` unless you pass it, so a future release of the
underlying engine cannot silently start throwing inside your templates.

## Examples

| Input | Output |
| --- | --- |
| `JUAN DE LA MAZA` | Juan de la Maza |
| `ludwig van beethoven` | Ludwig van Beethoven |
| `BERNARDO O'HIGGINS` | Bernardo O'Higgins |
| `bernardo o’higgins` | Bernardo O’Higgins |
| `jean-pierre dupont` | Jean-Pierre Dupont |
| `gabriel garcía márquez` | Gabriel García Márquez |
| `MIGUEL DE CERVANTES Y SAAVEDRA` | Miguel de Cervantes y Saavedra |
| `van gogh` | Van Gogh |

Formatting rules, Unicode handling and known limitations (such as `Mac` prefixes and
camel-cased names like `DeShawn`) are documented in
[name-capitalize](https://www.npmjs.com/package/name-capitalize).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Contributing

Release process, including the manual npm approval step: [RELEASING.md](./RELEASING.md).

## License

MIT © [Gabriel Galilea](https://github.com/gabo2151)
