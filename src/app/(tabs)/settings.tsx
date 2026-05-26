import { View, ScrollView, Text, Alert, Switch } from 'react-native';
import { useShiftStore } from '../../store/useShiftStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useState } from 'react';

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useShiftStore();

  const [form, setForm] = useState({ ...settings });

  const handleChange = (key: keyof typeof settings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Basic validation
    const regularRate = parseFloat(form.regularHourlyRate as any);
    const overtimeRate = parseFloat(form.overtimeHourlyRate as any);
    const morningDur = parseFloat(form.morningShiftDuration as any);
    const afternoonDur = parseFloat(form.afternoonShiftDuration as any);
    const nightDur = parseFloat(form.nightShiftDuration as any);
    const payLen = parseInt(form.payPeriodLengthDays as any, 10);
    const weekStart = parseInt(form.weekStartDay as any, 10);

    if (
      isNaN(regularRate) ||
      isNaN(overtimeRate) ||
      isNaN(morningDur) ||
      isNaN(afternoonDur) ||
      isNaN(nightDur) ||
      isNaN(payLen) ||
      isNaN(weekStart)
    ) {
      Alert.alert('Invalid Input', 'Please ensure all numeric fields contain valid numbers.');
      return;
    }

    updateSettings({
      employeeName: form.employeeName,
      regularHourlyRate: regularRate,
      overtimeHourlyRate: overtimeRate,
      morningShiftStart: form.morningShiftStart,
      morningShiftDuration: morningDur,
      afternoonShiftStart: form.afternoonShiftStart,
      afternoonShiftDuration: afternoonDur,
      nightShiftStart: form.nightShiftStart,
      nightShiftDuration: nightDur,
      payPeriodLengthDays: payLen,
      payPeriodStartDate: form.payPeriodStartDate,
      weekStartDay: weekStart as any,
    });

    Alert.alert('Success', 'Settings have been saved.');
  };

  const handleReset = () => {
    Alert.alert('Reset Settings', 'Are you sure you want to revert to default settings?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetSettings();
          setForm(useShiftStore.getState().settings);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="mb-4 text-xl font-bold text-gray-900">Personal Info</Text>
        <Input
          label="Employee Name"
          value={form.employeeName}
          onChangeText={(v) => handleChange('employeeName', v)}
          placeholder="John Doe"
        />

        <Text className="mb-4 mt-4 text-xl font-bold text-gray-900">Pay Configuration</Text>
        <Input
          label="Regular Hourly Rate ($)"
          value={String(form.regularHourlyRate)}
          onChangeText={(v) => handleChange('regularHourlyRate', v)}
          keyboardType="decimal-pad"
        />
        <Input
          label="Overtime Hourly Rate ($)"
          value={String(form.overtimeHourlyRate)}
          onChangeText={(v) => handleChange('overtimeHourlyRate', v)}
          keyboardType="decimal-pad"
        />
        <Input
          label="Pay Period Length (Days)"
          value={String(form.payPeriodLengthDays)}
          onChangeText={(v) => handleChange('payPeriodLengthDays', v)}
          keyboardType="number-pad"
        />
        <Input
          label="Pay Period Start Anchor Date (YYYY-MM-DD)"
          value={form.payPeriodStartDate}
          onChangeText={(v) => handleChange('payPeriodStartDate', v)}
        />
        <Input
          label="Week Starts On (0=Sun, 1=Mon...)"
          value={String(form.weekStartDay)}
          onChangeText={(v) => handleChange('weekStartDay', v)}
          keyboardType="number-pad"
        />

        <Text className="mb-4 mt-4 text-xl font-bold text-gray-900">Shift Defaults</Text>
        <Text className="font-semibold text-gray-700">Morning Shift</Text>
        <View className="flex-row gap-4 mb-2">
          <Input
            className="flex-1"
            label="Start Time"
            value={form.morningShiftStart}
            onChangeText={(v) => handleChange('morningShiftStart', v)}
          />
          <Input
            className="flex-1"
            label="Duration (hrs)"
            value={String(form.morningShiftDuration)}
            onChangeText={(v) => handleChange('morningShiftDuration', v)}
            keyboardType="decimal-pad"
          />
        </View>

        <Text className="font-semibold text-gray-700">Afternoon Shift</Text>
        <View className="flex-row gap-4 mb-2">
          <Input
            className="flex-1"
            label="Start Time"
            value={form.afternoonShiftStart}
            onChangeText={(v) => handleChange('afternoonShiftStart', v)}
          />
          <Input
            className="flex-1"
            label="Duration (hrs)"
            value={String(form.afternoonShiftDuration)}
            onChangeText={(v) => handleChange('afternoonShiftDuration', v)}
            keyboardType="decimal-pad"
          />
        </View>

        <Text className="font-semibold text-gray-700">Night Shift</Text>
        <View className="flex-row gap-4 mb-2">
          <Input
            className="flex-1"
            label="Start Time"
            value={form.nightShiftStart}
            onChangeText={(v) => handleChange('nightShiftStart', v)}
          />
          <Input
            className="flex-1"
            label="Duration (hrs)"
            value={String(form.nightShiftDuration)}
            onChangeText={(v) => handleChange('nightShiftDuration', v)}
            keyboardType="decimal-pad"
          />
        </View>

        <Text className="mb-4 mt-4 text-xl font-bold text-gray-900">Policies</Text>
        <View className="flex-row items-center justify-between mb-4 bg-white p-4 rounded-xl border border-gray-200">
          <View className="flex-1 pr-4">
            <Text className="font-semibold text-gray-900 text-base">Double Pay for Public Holidays</Text>
            <Text className="text-gray-500 text-xs mt-1">If enabled, hours logged on public holidays will be paid at twice your regular rate instead of standard calculations.</Text>
          </View>
          <Switch
            value={form.doublePayForPublicHolidays}
            onValueChange={(val) => handleChange('doublePayForPublicHolidays', val as any)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={'#ffffff'}
          />
        </View>

        <View className="mt-8 mb-12 gap-4">
          <Button label="Save Settings" onPress={handleSave} />
          <Button label="Reset Defaults" variant="danger" onPress={handleReset} />
        </View>
      </ScrollView>
    </View>
  );
}
