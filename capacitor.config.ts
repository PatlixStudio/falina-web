import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.falina.app',
  appName: 'Falina',
  webDir: 'dist/falina-web/browser',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: '#12100e',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      backgroundColor: '#12100e',
      style: 'DARK',
    },
  },
};

export default config;
