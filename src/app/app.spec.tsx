import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, vi } from 'vitest';

import App from './app';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('shows the release version it was built with', () => {
    vi.stubEnv('VITE_APP_VERSION', '2.0.0');
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('v2.0.0')).toBeTruthy();
  });

  it('shows no version when built outside a release', () => {
    vi.stubEnv('VITE_APP_VERSION', undefined);
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/^v\d/)).toBeNull();
  });
});
