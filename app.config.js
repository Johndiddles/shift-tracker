const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

export default {
  expo: {
    name: IS_DEV
      ? "Shift Mate-Dev"
      : IS_PREVIEW
        ? "Shift Mate-Staging"
        : "Shift Mate",
    slug: "shift-mate",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "shiftmate",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundImage: "./assets/images/adaptive-icon.png",
        monochromeImage: "./assets/images/adaptive-icon.png",
      },
      predictiveBackGestureEnabled: false,
      package: IS_DEV
        ? "com.johndiddles.shiftmate.dev"
        : IS_PREVIEW
          ? "com.johndiddles.shiftmate.staging"
          : "com.johndiddles.shiftmate",
      blockedPermissions: ["android.permission.READ_MEDIA_VIDEO"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 76,
          },
        },
      ],
      "expo-sharing",
      "@react-native-community/datetimepicker",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "38524892-3437-4876-92ff-bc82eaeb770f",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  },
};
