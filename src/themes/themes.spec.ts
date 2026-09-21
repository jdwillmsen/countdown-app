import { contrastRatio, over, parseColor } from './contrast';
import { themes, type ThemeName } from './themes';

const BLACK = { r: 0, g: 0, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

describe('themes', () => {
  // A background photo can be anything, so a translucent card has to stay
  // readable over both extremes it could show through.
  it.each(Object.keys(themes) as ThemeName[])(
    '%s card text meets WCAG AA',
    (name) => {
      const { vars } = themes[name];
      for (const photo of [BLACK, WHITE]) {
        const frame = over(parseColor(vars['--frame-bg']), photo);
        const card = over(parseColor(vars['--card-bg']), frame);
        const text = over(parseColor(vars['--card-text']), card);
        expect(contrastRatio(text, card)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it('camp reproduces the original look', () => {
    expect(themes.camp.vars).toEqual({
      '--frame-bg': 'rgba(0, 0, 0, 0.8)',
      '--frame-border': '#fff',
      '--card-bg': 'rgba(255, 255, 255, 0.8)',
      '--card-text': '#333',
      '--card-border': '#fff',
      '--accent': '#2f5d3a',
      '--font-family': 'inherit',
    });
  });
});
