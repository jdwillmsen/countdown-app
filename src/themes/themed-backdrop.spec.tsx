import { render, screen } from '@testing-library/react';
import { ThemedBackdrop } from './themed-backdrop';

describe('ThemedBackdrop', () => {
  it('applies the theme vars and the photo when given one', () => {
    render(
      <ThemedBackdrop theme="lake" image="/photo.webp">
        <p>inside</p>
      </ThemedBackdrop>,
    );
    const root = screen.getByText('inside').parentElement as HTMLElement;
    expect(root.style.getPropertyValue('--card-text')).toBe('#0b3050');
    expect(root.style.backgroundImage).toContain('/photo.webp');
  });

  it('falls back to the theme backdrop without a photo', () => {
    render(
      <ThemedBackdrop theme="night">
        <p>inside</p>
      </ThemedBackdrop>,
    );
    const root = screen.getByText('inside').parentElement as HTMLElement;
    expect(root.style.backgroundImage).toContain('linear-gradient');
  });
});
