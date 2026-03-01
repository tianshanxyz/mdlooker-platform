// Capacitor配置 - 仅在构建移动APP时使用
// 注意: 需要安装 @capacitor/cli 才能使用此配置

const config = {
  appId: 'com.mdlooker.app',
  appName: 'MDLooker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#339999',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#339999',
    },
  },
};

export default config;
