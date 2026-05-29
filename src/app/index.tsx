import { Redirect } from "expo-router";
import { useShiftStore } from "../store/useShiftStore";
import { View, ActivityIndicator, Text } from "react-native";
import { Clock } from "lucide-react-native";

export default function Index() {
  const hasHydrated = useShiftStore((state) => state._hasHydrated);
  const isSetupComplete = useShiftStore((state) => state.isSetupComplete);
  const employeeName = useShiftStore((state) => state.settings.employeeName);

  if (!hasHydrated) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <View className="items-center">
          <View className="h-16 w-16 bg-blue-50 rounded-3xl items-center justify-center mb-4">
            <Clock size={32} color="#2563eb" />
          </View>
          <Text className="text-lg font-bold text-gray-900 mb-2">
            Loading Shift Tracker
          </Text>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      </View>
    );
  }

  const needsSetup = !isSetupComplete || employeeName === "";

  if (needsSetup) {
    return <Redirect href={"/setup" as any} />;
  }

  return <Redirect href="/(tabs)" />;
}
