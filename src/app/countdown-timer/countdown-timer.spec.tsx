import { render } from '@testing-library/react';

import CountdownTimer from './countdown-timer';
import { expect } from 'vitest';

describe('CountdownTimer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CountdownTimer targetDate={new Date()} />);
    expect(baseElement).toBeTruthy();
  });

  it('should render successfully with title', () => {
    const { baseElement } = render(
      <CountdownTimer targetDate={new Date()} title={'Test Title'} />
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render successfully with completeMessage', () => {
    const { baseElement } = render(
      <CountdownTimer
        targetDate={new Date()}
        completeMessage={'Test Message'}
      />
    );
    expect(baseElement).toBeTruthy();
  });
});
