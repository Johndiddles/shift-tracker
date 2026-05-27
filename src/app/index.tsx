import { Redirect } from "expo-router";
import { useShiftStore } from "../store/useShiftStore";

export default function Index() {
  const isSetupComplete = useShiftStore((state) => state.isSetupComplete);
  const employeeName = useShiftStore((state) => state.settings.employeeName);

  const needsSetup = !isSetupComplete || employeeName === "";

  if (needsSetup) {
    return <Redirect href={"/setup" as any} />;
  }

  return <Redirect href="/(tabs)" />;
}
