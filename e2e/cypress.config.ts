import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      ciWebServerCommand: 'npx nx run countdown-app:serve-static',
      webServerCommands: {
        default: 'npx nx run countdown-app:serve',
        production: 'npx nx run countdown-app:serve:production',
        ci: 'npx nx run countdown-app:serve-static',
      },
      cypressDir: 'src',
      bundler: 'vite',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
