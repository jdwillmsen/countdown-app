import { contrastRatio, over, parseColor } from './contrast';

describe('contrast', () => {
  it('parses hex and rgba', () => {
    expect(parseColor('#333')).toEqual({ r: 51, g: 51, b: 51, a: 1 });
    expect(parseColor('#1e6fa8')).toEqual({ r: 30, g: 111, b: 168, a: 1 });
    expect(parseColor('rgba(255, 255, 255, 0.8)')).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 0.8,
    });
  });

  it('composites a translucent color over an opaque one', () => {
    expect(
      over(parseColor('rgba(0, 0, 0, 0.5)'), { r: 255, g: 255, b: 255 }),
    ).toEqual({
      r: 127.5,
      g: 127.5,
      b: 127.5,
    });
  });

  it('computes the WCAG ratio', () => {
    const black = { r: 0, g: 0, b: 0 };
    const white = { r: 255, g: 255, b: 255 };
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });
});
