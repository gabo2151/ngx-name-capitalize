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
  template: `<span>{{ name | namecase }}</span><em>{{ name | namecase: options }}</em>`,
})
class HostComponent {
  name: string | null = null;
  options = { mcPrefix: true };
}

// Angular 12 and 13 have no standalone pipes, so every template-level check goes
// through the module. On the 2.x and 3.x lines there is a second suite covering
// the standalone import path as well.
describe('NameCapitalizePipe through NgxNameCapitalizeModule', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [HostComponent],
      imports: [NgxNameCapitalizeModule],
    }).createComponent(HostComponent);
  });

  const render = (selector: string): string =>
    fixture.nativeElement.querySelector(selector).textContent;

  it('is exported by the module under the `namecase` name', () => {
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
