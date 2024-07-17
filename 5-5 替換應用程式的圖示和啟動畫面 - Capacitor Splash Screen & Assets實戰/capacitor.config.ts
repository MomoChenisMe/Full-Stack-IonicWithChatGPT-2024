import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.momochenisme.aiconversationapp',
  appName: 'AI英語口說導師',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
    },
  }
};

export default config;
