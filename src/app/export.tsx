import DateTimePicker from "@react-native-community/datetimepicker";
import {
  endOfDay,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { useShiftStore } from "../store/useShiftStore";
import { calculatePeriodSummary, generatePDFHtml } from "../utils/calculations";

export default function ExportScreen() {
  const { start, end } = useLocalSearchParams<{
    start?: string;
    end?: string;
  }>();
  const { shifts, settings, publicHolidays } = useShiftStore();

  const [startDate, setStartDate] = useState(
    start ? parseISO(start) : new Date(),
  );
  const [endDate, setEndDate] = useState(end ? parseISO(end) : new Date());

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const { filteredShifts, summary } = useMemo(() => {
    const s = startOfDay(startDate);
    const e = endOfDay(endDate);

    const fShifts = shifts.filter((shift) => {
      const d = parseISO(shift.date);
      return isWithinInterval(d, { start: s, end: e });
    });

    const sum = calculatePeriodSummary(fShifts, s, e, settings, publicHolidays);

    return { filteredShifts: fShifts, summary: sum };
  }, [shifts, startDate, endDate, settings, publicHolidays]);

  const handleExportPDF = async () => {
    if (filteredShifts.length === 0) {
      Alert.alert(
        "No Data",
        "There are no shifts in the selected date range to export.",
      );
      return;
    }

    try {
      setIsExporting(true);
      const html = generatePDFHtml(
        filteredShifts,
        summary,
        startOfDay(startDate),
        endOfDay(endDate),
        settings,
        publicHolidays,
      );

      // Check and request file system permissions before file operations
      if (!permissionResponse?.granted) {
        const response = await requestPermission();
        if (!response.granted) {
          setIsExporting(false);
          Alert.alert(
            "Permission Required",
            "File system permission is required to export and save the report.",
          );
          return;
        }
      }

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Create a nice file name and copy the file to the document directory to ensure it is shareable
      const safeStartDate = format(startDate, "MMM_dd_yyyy");
      const safeEndDate = format(endDate, "MMM_dd_yyyy");
      const filename = `ShiftTrack_Report_${safeStartDate}_to_${safeEndDate}.pdf`;
      const newFileDir = new FileSystem.Directory(
        FileSystem.Paths.document,
        "shift-tracker",
      );

      if (!newFileDir.exists) {
        newFileDir.create();
      }

      const destinationFile = new FileSystem.File(newFileDir, filename);

      if (destinationFile.exists) {
        destinationFile.delete();
      }

      await new FileSystem.File(uri).copy(destinationFile);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(destinationFile.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Share ShiftTrack Report",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert(
          "Sharing Unavailable",
          "Sharing is not available on this device.",
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Export Failed",
        "An error occurred while generating the PDF.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-2 text-sm font-medium text-gray-700">
          Start Date
        </Text>
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          className="mb-4 h-14 justify-center rounded-xl border border-gray-200 bg-white px-4"
        >
          <Text className="text-base text-gray-900">
            {format(startDate, "EEEE, MMM d, yyyy")}
          </Text>
        </TouchableOpacity>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onValueChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === "ios");
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        <Text className="mb-2 text-sm font-medium text-gray-700">End Date</Text>
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          className="mb-6 h-14 justify-center rounded-xl border border-gray-200 bg-white px-4"
        >
          <Text className="text-base text-gray-900">
            {format(endDate, "EEEE, MMM d, yyyy")}
          </Text>
        </TouchableOpacity>

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onValueChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === "ios");
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}

        <View className="mb-8 rounded-2xl bg-blue-50 p-4 border border-blue-100">
          <Text className="mb-2 text-sm font-bold text-blue-900">
            Export Summary
          </Text>
          <Text className="text-sm text-blue-800">
            Shifts included: {filteredShifts.length}
          </Text>
          <Text className="text-sm text-blue-800">
            Total Hours: {summary.totalHours.toFixed(2)}
          </Text>
        </View>

        <Button
          label="Export as PDF"
          onPress={handleExportPDF}
          isLoading={isExporting}
          className="mb-4 shadow-lg shadow-blue-500/30"
        />

        <Button
          label="Cancel"
          variant="secondary"
          onPress={() => router.back()}
        />
      </ScrollView>
    </View>
  );
}
