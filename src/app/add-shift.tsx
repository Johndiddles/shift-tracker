import DateTimePicker from "@react-native-community/datetimepicker";
import { addHours, format, parseISO } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ShiftEntry, ShiftType, useShiftStore } from "../store/useShiftStore";
import { calculateShiftHours } from "../utils/calculations";

export default function AddShiftScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    shifts,
    settings,
    publicHolidays,
    togglePublicHoliday,
    addShift,
    updateShift,
    deleteShift,
  } = useShiftStore();

  const existingShift = id ? shifts.find((s) => s.id === id) : null;

  const [date, setDate] = useState(new Date());
  const [shiftType, setShiftType] = useState<ShiftType>("MORNING");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [notes, setNotes] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const distinctDates = useMemo(() => {
    const s = new Date(startTime);
    const e = new Date(endTime);
    s.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    e.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    if (e < s) {
      e.setDate(e.getDate() + 1);
    }
    return Array.from(
      new Set([format(s, "yyyy-MM-dd"), format(e, "yyyy-MM-dd")]),
    );
  }, [startTime, endTime, date]);

  useEffect(() => {
    if (existingShift) {
      setDate(parseISO(existingShift.date));
      setShiftType(existingShift.shiftType);
      setStartTime(parseISO(existingShift.startTime));
      setEndTime(parseISO(existingShift.endTime));
      setNotes(existingShift.notes || "");
    } else {
      applyShiftDefaults("MORNING", date);
    }
  }, [existingShift]);

  const applyShiftDefaults = (type: ShiftType, baseDate: Date) => {
    let startStr = settings.morningShiftStart;
    let dur = settings.morningShiftDuration;

    if (type === "AFTERNOON") {
      startStr = settings.afternoonShiftStart;
      dur = settings.afternoonShiftDuration;
    } else if (type === "NIGHT") {
      startStr = settings.nightShiftStart;
      dur = settings.nightShiftDuration;
    }

    if (type !== "CUSTOM") {
      const [hours, minutes] = startStr.split(":").map(Number);
      const st = new Date(baseDate);
      st.setHours(hours, minutes, 0, 0);
      setStartTime(st);

      const et = addHours(st, dur);
      setEndTime(et);
    }
  };

  const handleShiftTypeChange = (type: ShiftType) => {
    setShiftType(type);
    applyShiftDefaults(type, date);
  };

  const handleSave = () => {
    // Basic validation
    // Calculate hours worked
    const hoursWorked = calculateShiftHours(
      startTime.toISOString(),
      endTime.toISOString(),
    );

    if (hoursWorked <= 0 || hoursWorked > 24) {
      Alert.alert(
        "Invalid Times",
        "Shift duration must be greater than 0 and up to 24 hours.",
      );
      return;
    }

    // Check for duplicates if adding new
    if (!existingShift) {
      const isDuplicate = shifts.some(
        (s) =>
          s.date === format(date, "yyyy-MM-dd") && s.shiftType === shiftType,
      );
      if (isDuplicate) {
        Alert.alert(
          "Duplicate Shift",
          "A shift of this type is already logged for this date.",
        );
        return;
      }
    }

    const shiftData: Omit<ShiftEntry, "id" | "createdAt" | "updatedAt"> = {
      date: format(date, "yyyy-MM-dd"),
      shiftType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      hoursWorked,
      notes,
    };

    if (existingShift) {
      updateShift(existingShift.id, shiftData);
    } else {
      addShift(shiftData);
    }

    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete Shift", "Are you sure you want to delete this shift?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteShift(existingShift!.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-2 text-sm font-medium text-gray-700">Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="mb-4 h-14 justify-center rounded-xl border border-gray-200 bg-white px-4"
        >
          <Text className="text-base text-gray-900">
            {format(date, "EEEE, MMM d, yyyy")}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onValueChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === "ios");
              if (selectedDate) {
                setDate(selectedDate);
                if (shiftType !== "CUSTOM") {
                  applyShiftDefaults(shiftType, selectedDate);
                }
              }
            }}
          />
        )}

        <Text className="mb-2 text-sm font-medium text-gray-700">
          Shift Type
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {(["MORNING", "AFTERNOON", "NIGHT", "CUSTOM"] as ShiftType[]).map(
            (type) => {
              const getShiftLabel = (t: ShiftType) => {
                switch (t) {
                  case "MORNING":
                    return settings.morningShiftLabel || "Morning";
                  case "AFTERNOON":
                    return settings.afternoonShiftLabel || "Afternoon";
                  case "NIGHT":
                    return settings.nightShiftLabel || "Night";
                  case "CUSTOM":
                    return settings.customShiftLabel || "Custom";
                  default:
                    return t;
                }
              };
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleShiftTypeChange(type)}
                  className={`rounded-xl border px-4 py-3 ${
                    shiftType === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text
                    className={`font-semibold ${shiftType === type ? "text-blue-600" : "text-gray-600"}`}
                  >
                    {getShiftLabel(type)}
                  </Text>
                </TouchableOpacity>
              );
            },
          )}
        </View>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Start Time
            </Text>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              className="h-14 justify-center rounded-xl border border-gray-200 bg-white px-4"
            >
              <Text className="text-base text-gray-900">
                {format(startTime, "h:mm a")}
              </Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onValueChange={(event, selectedDate) => {
                  setShowStartTimePicker(Platform.OS === "ios");
                  if (selectedDate) setStartTime(selectedDate);
                }}
              />
            )}
          </View>
          <View className="flex-1">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              End Time
            </Text>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              className="h-14 justify-center rounded-xl border border-gray-200 bg-white px-4"
            >
              <Text className="text-base text-gray-900">
                {format(endTime, "h:mm a")}
              </Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onValueChange={(event, selectedDate) => {
                  setShowEndTimePicker(Platform.OS === "ios");
                  if (selectedDate) setEndTime(selectedDate);
                }}
              />
            )}
          </View>
        </View>

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g., covered for John"
        />

        {distinctDates.map((dateStr) => (
          <View
            key={dateStr}
            className="flex-row items-center justify-between mb-4 mt-2 bg-white p-4 rounded-xl border border-gray-200"
          >
            <View className="flex-1 pr-4">
              <Text className="font-semibold text-gray-900 text-base">
                Public Holiday: {format(parseISO(dateStr), "MMM d")}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                Mark {format(parseISO(dateStr), "MMM d")} as a public holiday.
                Hours worked on this date will be paid double if enabled in
                settings.
              </Text>
            </View>
            <Switch
              value={publicHolidays.includes(dateStr)}
              onValueChange={(val) => togglePublicHoliday(dateStr, val)}
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={"#ffffff"}
            />
          </View>
        ))}

        <View className="mt-8 gap-4 pb-12">
          <Button label="Save Shift" onPress={handleSave} />
          {existingShift && (
            <Button
              label="Delete Shift"
              variant="danger"
              onPress={handleDelete}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
