import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { registerSW } from 'virtual:pwa-register';

import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

const HOUR = 60 * 60 * 1000;

// The service worker serves the cached app on every load, so a new release
// would otherwise only appear on the load after the one that fetched it.
// Registering here (instead of the injected script) lets autoUpdate reload
// the page as soon as the new worker takes over, and the hourly check keeps a
// tab or installed app that is never reloaded from sitting on an old release.
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (registration) setInterval(() => registration.update(), HOUR);
  },
});
