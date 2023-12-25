import { render } from '@testing-library/react';

import CountdownTimer from './countdown-timer';

describe('CountdownTimer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CountdownTimer />);
    expect(baseElement).toBeTruthy();
  });
});
