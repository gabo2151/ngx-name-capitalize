import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameCapitalizePipe } from './name-capitalize.pipe';
import { NgxNameCapitalizeModule } from './ngx-name-capitalize.module';

describe('NameCapitalizePipe', () => {
  let pipe: NameCapitalizePipe;

  beforeEach(() => {
    pipe = new NameCapitalizePipe();
  });

  describe('formatting', () => {
    it.each([
      ['JUAN DE LA MAZA', 'Juan de la Maza'],
      ['ludwig van beethoven', 'Ludwig van Beethoven'],
      ["bernardo o'higgins", "Bernardo O'Higgins"],
      ['bernardo o’higgins', 'Bernardo O’Higgins'],
      ['JEAN-PIERRE DUPONT', 'Jean-Pierre Dupont'],
      ['gabriel garcía márquez', 'Gabriel García Márquez'],
      ['MIGUEL DE CERVANTES Y SAAVEDRA', 'Miguel de Cervantes y Saavedra'],
      ['van gogh', 'Van Gogh'],
      // A non-breaking space separates words (it is what Word, Excel and PDFs paste
      // in) and survives into the output: interior spacing is preserved verbatim.
      ['mar\u00EDa\u00A0jos\u00E9', 'Mar\u00EDa\u00A0Jos\u00E9'],
      ['ﬂorian', 'Florian'],
    ])('formats %s', (input, expected) => {
      expect(pipe.transform(input)).toBe(expected);
    });

    it('is idempotent', () => {
      const once = pipe.transform('JUAN DE LA MAZA');
      expect(pipe.transform(once)).toBe(once);
    });
  });

  describe('nullish input', () => {
    it('returns an empty string for an empty string', () => {
      expect(pipe.transform('')).toBe('');
    });

    it('returns an empty string for null', () => {
      expect(pipe.transform(null)).toBe('');
    });

    it('returns an empty string for undefined', () => {
      expect(pipe.transform(undefined)).toBe('');
    });

    // Regression: the pipe used to short-circuit on falsy input, which made
    // `strict` unreachable through the pipe — the option would silently do
    // nothing for exactly the input it exists to catch.
    it('throws for null when strict is enabled', () => {
      expect(() => pipe.transform(null, { strict: true })).toThrow(TypeError);
    });

    it('throws for undefined when strict is enabled', () => {
      expect(() => pipe.transform(undefined, { strict: true })).toThrow(TypeError);
    });

    it('does not throw for an empty string when strict is enabled', () => {
      expect(pipe.transform('', { strict: true })).toBe('');
    });
  });

  describe('options forwarding', () => {
    it('forwards mcPrefix', () => {
      expect(pipe.transform('ronald mcdonald', { mcPrefix: true })).toBe('Ronald McDonald');
      expect(pipe.transform('ronald mcdonald')).toBe('Ronald Mcdonald');
    });

    it('forwards ignoreParticles', () => {
      expect(pipe.transform('dick van dyke', { ignoreParticles: ['van'] })).toBe('Dick Van Dyke');
    });

    it('forwards extraParticles', () => {
      expect(pipe.transform('joan sa costa', { extraParticles: ['sa'] })).toBe('Joan sa Costa');
    });

    it('forwards particles', () => {
      expect(pipe.transform('juan de la maza', { particles: ['de'] })).toBe('Juan de La Maza');
    });

    it('forwards particlesAfterHyphen', () => {
      expect(pipe.transform('jean-de-la-maza')).toBe('Jean-De-La-Maza');
      expect(pipe.transform('jean-de-la-maza', { particlesAfterHyphen: true })).toBe(
        'Jean-de-la-Maza',
      );
    });
  });
});

@Component({
  standalone: true,
  imports: [NameCapitalizePipe],
  template: `<span>{{ name | namecase }}</span><em>{{ name | namecase:options }}</em>`,
})
class StandaloneHostComponent {
  name: string | null = null;
  options = { mcPrefix: true };
}

describe('NameCapitalizePipe in a standalone component', () => {
  let fixture: ComponentFixture<StandaloneHostComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      imports: [StandaloneHostComponent],
    }).createComponent(StandaloneHostComponent);
  });

  const render = (selector: string): string =>
    fixture.nativeElement.querySelector(selector).textContent;

  it('is registered under the `namecase` name', () => {
    fixture.componentInstance.name = 'JUAN DE LA MAZA';
    fixture.detectChanges();

    expect(render('span')).toBe('Juan de la Maza');
  });

  it('accepts a nullish binding without rendering "null"', () => {
    fixture.detectChanges();

    expect(render('span')).toBe('');
  });

  it('accepts an options argument from the template', () => {
    fixture.componentInstance.name = 'ronald mcdonald';
    fixture.detectChanges();

    expect(render('em')).toBe('Ronald McDonald');
  });
});

@Component({
  template: `{{ name | namecase }}`,
})
class ModuleHostComponent {
  name = 'JUAN DE LA MAZA';
}

describe('NgxNameCapitalizeModule', () => {
  // Proves the module actually exports the pipe: importing the module has to be
  // enough for a declared component to use `namecase`.
  it('exports the pipe to declared components', () => {
    const fixture = TestBed.configureTestingModule({
      declarations: [ModuleHostComponent],
      imports: [NgxNameCapitalizeModule],
    }).createComponent(ModuleHostComponent);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('Juan de la Maza');
  });
});
