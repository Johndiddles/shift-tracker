import "@/global.css";
import { Stack } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import { useEffect } from "react";

export default function RootLayout() {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (permissionResponse && !permissionResponse.granted && permissionResponse.canAskAgain) {
      requestPermission();
    }
  }, [permissionResponse]);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name="add-shift"
        options={{
          presentation: 'modal',
          title: 'Add / Edit Shift'
        }}
      />
      <Stack.Screen
        name="export"
        options={{
          presentation: 'modal',
          title: 'Export Data'
        }}
      />
    </Stack>
  );
}
