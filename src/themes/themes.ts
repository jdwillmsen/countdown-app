export type ThemeName = 'camp' | 'lake' | 'winter' | 'party' | 'night';

export type ThemeVars = Record<
  | '--frame-bg'
  | '--frame-border'
  | '--card-bg'
  | '--card-text'
  | '--card-border'
  | '--accent'
  | '--font-family',
  string
>;

export interface Theme {
  vars: ThemeVars;
  // Shown when an event has no photo of its own.
  backdrop: string;
}

export const themes: Record<ThemeName, Theme> = {
  camp: {
    vars: {
      '--frame-bg': 'rgba(0, 0, 0, 0.8)',
      '--frame-border': '#fff',
      '--card-bg': 'rgba(255, 255, 255, 0.8)',
      '--card-text': '#333',
      '--card-border': '#fff',
      '--accent': '#2f5d3a',
      '--font-family': 'inherit',
    },
    backdrop: 'linear-gradient(#2d4a36, #0d1a12)',
  },
  lake: {
    vars: {
      '--frame-bg': 'rgba(4, 30, 56, 0.8)',
      '--frame-border': '#e0f2ff',
      '--card-bg': 'rgba(240, 248, 255, 0.9)',
      '--card-text': '#0b3050',
      '--card-border': '#e0f2ff',
      '--accent': '#1c689d',
      '--font-family': "'Trebuchet MS', sans-serif",
    },
    backdrop: 'linear-gradient(#5aa9e6, #0b3050)',
  },
  winter: {
    vars: {
      '--frame-bg': 'rgba(20, 30, 48, 0.8)',
      '--frame-border': '#fff',
      '--card-bg': 'rgba(255, 255, 255, 0.9)',
      '--card-text': '#1c2a3a',
      '--card-border': '#fff',
      '--accent': '#2867be',
      '--font-family': 'Georgia, serif',
    },
    backdrop: 'linear-gradient(#dfe9f3, #8aa5c1)',
  },
  party: {
    vars: {
      '--frame-bg': 'rgba(40, 0, 50, 0.85)',
      '--frame-border': '#ffd23f',
      '--card-bg': 'rgba(255, 250, 235, 0.92)',
      '--card-text': '#3d0a4f',
      '--card-border': '#ffd23f',
      '--accent': '#c22164',
      '--font-family': "'Arial Rounded MT Bold', Arial, sans-serif",
    },
    backdrop: 'linear-gradient(135deg, #ff5f6d, #845ec2)',
  },
  night: {
    vars: {
      '--frame-bg': 'rgba(0, 0, 0, 0.8)',
      '--frame-border': 'rgba(255, 255, 255, 0.6)',
      '--card-bg': 'rgba(24, 24, 32, 0.9)',
      '--card-text': '#f2f2f2',
      '--card-border': 'rgba(255, 255, 255, 0.6)',
      '--accent': '#9ecbff',
      '--font-family': 'inherit',
    },
    backdrop: 'linear-gradient(#141e30, #243b55)',
  },
};
