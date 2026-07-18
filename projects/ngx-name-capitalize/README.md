# ngx-name-capitalize

[![npm version](https://img.shields.io/npm/v/ngx-name-capitalize/legacy-v2)](https://www.npmjs.org/package/ngx-name-capitalize/v/latest?tag=legacy-v2)
[![install size](https://packagephobia.com/badge?p=ngx-name-capitalize@legacy-v2)](https://packagephobia.com/result?p=ngx-name-capitalize@legacy-v2)
[![npm downloads](https://img.shields.io/npm/dm/ngx-name-capitalize)](https://npm-stat.com/charts.html?package=ngx-name-capitalize)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Angular pipe for smart capitalization of person names. Handles compound surnames, particles (de, del, la, van, von...), hyphenated names, apostrophes, and Unicode characters.

Built on top of [name-capitalize](https://www.npmjs.com/package/name-capitalize).


## Compatibility

| ngx-name-capitalize | Angular | Node  |
|---------------------|---------|-------|
| 1.x                 | 12 – 13 | >= 16 |
| 2.x                 | 14 – 15 | >= 18 |
| 3.x                 | 16+     | >= 18 |


## Installation

```bash
npm install ngx-name-capitalize
```


## Usage

### Standalone (Angular 14+)

```typescript
import { NameCapitalizePipe } from 'ngx-name-capitalize';

@Component({
  standalone: true,
  imports: [NameCapitalizePipe],
  template: `{{ name | namecase }}`
})
export class MyComponent { }
```

### NgModule (Angular 14 – 15)

```typescript
import { NgxNameCapitalizeModule } from 'ngx-name-capitalize';

@NgModule({
  imports: [NgxNameCapitalizeModule]
})
export class AppModule { }
```

### In your template

```html
{{ 'JUAN DE LA MAZA' | namecase }}
<!-- Output: Juan de la Maza -->

{{ "bernardo o'higgins riquelme" | namecase }}
<!-- Output: Bernardo O'Higgins Riquelme -->

{{ 'jean-pierre dupont' | namecase }}
<!-- Output: Jean-Pierre Dupont -->
```

### Options

The pipe forwards an optional `NameCapitalizeOptions` object to the underlying
[name-capitalize](https://www.npmjs.com/package/name-capitalize) engine:

```html
{{ 'ronald mcdonald' | namecase:{ mcPrefix: true } }}
<!-- Output: Ronald McDonald -->

{{ 'dick van dyke' | namecase:{ ignoreParticles: ['van'] } }}
<!-- Output: Dick Van Dyke -->
```

| Option            | Type                 | Description                                          |
|-------------------|----------------------|------------------------------------------------------|
| `particles`       | `Iterable<string>`   | Replace the built-in particle list entirely.         |
| `extraParticles`  | `Iterable<string>`   | Add extra particles on top of the built-in list.     |
| `ignoreParticles` | `Iterable<string>`   | Remove particles from the built-in list.             |
| `mcPrefix`        | `boolean`            | Capitalize the letter after `Mc` (`mcdonald` → `McDonald`). |

The `NameCapitalizeOptions` type is re-exported for use in your components:

```typescript
import { NameCapitalizeOptions } from 'ngx-name-capitalize';
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


## Examples

| Input                            | Output                         |
|----------------------------------|--------------------------------|
| `JUAN DE LA MAZA`                | Juan de la Maza                |
| `ludwig van beethoven`           | Ludwig van Beethoven           |
| `BERNARDO O'HIGGINS`             | Bernardo O'Higgins             |
| `jean-pierre dupont`             | Jean-Pierre Dupont             |
| `gabriel garcía márquez`         | Gabriel García Márquez         |
| `MIGUEL DE CERVANTES Y SAAVEDRA` | Miguel de Cervantes y Saavedra |
| `van gogh`                       | Van Gogh                       |


## License

MIT © [Gabriel Galilea](https://github.com/gabo2151)
