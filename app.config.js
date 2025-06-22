module.exports = {
  expo: {
    name: "The HelpIt",
    displayName: "The HelpIt",
    slug: "help-it",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo-helpit.png", // updated icon for Android < 8.0
    scheme: "helpitscheme",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.katareayush.helpit",
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo-helpit.png", // updated adaptive icon for Android 8+
        backgroundColor: "#ffffff"
      },
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      eas: {
        projectId: "291164d5-5552-4182-99ad-f65183b21644",
      },
    }
  }
};
