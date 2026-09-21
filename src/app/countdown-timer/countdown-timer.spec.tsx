import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import CountdownTimer from './countdown-timer';

const segment = (label: string) =>
  screen.getByText(label).previousElementSibling?.textContent;

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2025, 0, 1, 0, 0, 0));
  });
  afterEach(() => vi.useRealTimers());

  it('shows the remaining time on the very first render', () => {
    const target = new Date(Date.UTC(2025, 0, 3, 3, 4, 5));
    render(<CountdownTimer targetDate={target} title="T" />);
    expect(segment('Days')).toBe('2');
    expect(segment('Hours')).toBe('3');
    expect(segment('Minutes')).toBe('4');
    expect(segment('Seconds')).toBe('5');
  });

  it('switches to the complete message when the target arrives', () => {
    const target = new Date(Date.UTC(2025, 0, 1, 0, 0, 2));
    render(<CountdownTimer targetDate={target} completeMessage="Here!" />);
    expect(screen.queryByText('Here!')).toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('Here!')).toBeTruthy();
  });

  it('shows the date line in both states', () => {
    const { rerender } = render(
      <CountdownTimer
        targetDate={new Date(Date.UTC(2030, 0, 1))}
        date="Jan 1, 2030"
      />,
    );
    expect(screen.getByText('Jan 1, 2030')).toBeTruthy();
    rerender(
      <CountdownTimer
        targetDate={new Date(Date.UTC(2020, 0, 1))}
        date="Jan 1, 2020"
      />,
    );
    expect(screen.getByText('Jan 1, 2020')).toBeTruthy();
  });
});
