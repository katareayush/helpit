export default {
  expo: {
    newArchEnabled: true,
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      eas: {
        projectId: "291164d5-5552-4182-99ad-f65183b21644",
      },
    },
    android: {
      package: "com.katareayush.helpit"
    },
    scheme: "helpitscheme",
  },
};