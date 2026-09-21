interface ImportMetaEnv {
  // Set only by the release workflow; local and preview builds leave it unset.
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
