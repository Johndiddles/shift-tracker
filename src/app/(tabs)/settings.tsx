import { View, ScrollView, Text, Alert, Switch, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { useShiftStore } from '../../store/useShiftStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CURRENCIES, getCurrency } from '../../constants/currencies';
import { Globe, Search, ChevronRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, resetSettings } = useShiftStore();

  const [form, setForm] = useState({
    ...settings,
    currency: settings.currency || 'USD',
    morningShiftLabel: settings.morningShiftLabel || 'Morning',
    afternoonShiftLabel: settings.afternoonShiftLabel || 'Afternoon',
    nightShiftLabel: settings.nightShiftLabel || 'Night',
    customShiftLabel: settings.customShiftLabel || 'Custom',
  });
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMorningTimePicker, setShowMorningTimePicker] = useState(false);
  const [showAfternoonTimePicker, setShowAfternoonTimePicker] = useState(false);
  const [showNightTimePicker, setShowNightTimePicker] = useState(false);

  const parseTimeStringToDate = (timeStr: string) => {
    const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0, minutes || 0, 0, 0);
    return date;
  };

  const formatTimeToStr = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleChange = (key: keyof typeof settings, value: string | boolean) => {
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

    const morningLabel = (form.morningShiftLabel || 'Morning').trim();
    const afternoonLabel = (form.afternoonShiftLabel || 'Afternoon').trim();
    const nightLabel = (form.nightShiftLabel || 'Night').trim();
    const customLabel = (form.customShiftLabel || 'Custom').trim();

    if (!morningLabel || !afternoonLabel || !nightLabel || !customLabel) {
      Alert.alert('Invalid Input', 'Shift display labels cannot be empty.');
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(form.morningShiftStart) || !timeRegex.test(form.afternoonShiftStart) || !timeRegex.test(form.nightShiftStart)) {
      Alert.alert('Invalid Time Format', 'Shift starts must be in HH:MM 24-hour format (e.g. 07:00).');
      return;
    }

    updateSettings({
      employeeName: form.employeeName,
      currency: form.currency || 'USD',
      regularHourlyRate: regularRate,
      overtimeHourlyRate: overtimeRate,
      morningShiftStart: form.morningShiftStart,
      morningShiftDuration: morningDur,
      morningShiftLabel: morningLabel,
      afternoonShiftStart: form.afternoonShiftStart,
      afternoonShiftDuration: afternoonDur,
      afternoonShiftLabel: afternoonLabel,
      nightShiftStart: form.nightShiftStart,
      nightShiftDuration: nightDur,
      nightShiftLabel: nightLabel,
      customShiftLabel: customLabel,
      payPeriodLengthDays: payLen,
      payPeriodStartDate: form.payPeriodStartDate,
      weekStartDay: weekStart as any,
      doublePayForPublicHolidays: form.doublePayForPublicHolidays,
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
          const resetState = useShiftStore.getState().settings;
          setForm({
            ...resetState,
            currency: resetState.currency || 'USD',
            morningShiftLabel: resetState.morningShiftLabel || 'Morning',
            afternoonShiftLabel: resetState.afternoonShiftLabel || 'Afternoon',
            nightShiftLabel: resetState.nightShiftLabel || 'Night',
            customShiftLabel: resetState.customShiftLabel || 'Custom',
          });
        },
      },
    ]);
  };

  const activeCurrency = getCurrency(form.currency);

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.includes(currencySearch)
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <Text className="mb-4 text-xl font-bold text-gray-900">Personal Info & Currency</Text>
        
        <Input
          label="Employee Name"
          value={form.employeeName}
          onChangeText={(v) => handleChange('employeeName', v)}
          placeholder="John Doe"
        />

        <Text className="mb-2 text-sm font-medium text-gray-700">App Currency</Text>
        <TouchableOpacity
          onPress={() => setShowCurrencyModal(true)}
          className="h-14 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 mb-6 active:bg-gray-50"
        >
          <View className="flex-row items-center">
            <Globe size={20} color="#4b5563" />
            <Text className="ml-3 text-base text-gray-900 font-semibold">
              {activeCurrency.name} ({activeCurrency.code})
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold text-blue-600">
              {activeCurrency.symbol}
            </Text>
            <ChevronRight size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        <Text className="mb-4 text-xl font-bold text-gray-900">Pay Configuration</Text>
        <Input
          label={`Regular Hourly Rate (${activeCurrency.code} - ${activeCurrency.symbol})`}
          value={String(form.regularHourlyRate)}
          onChangeText={(v) => handleChange('regularHourlyRate', v)}
          keyboardType="decimal-pad"
        />
        <Input
          label={`Overtime Hourly Rate (${activeCurrency.code} - ${activeCurrency.symbol})`}
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
        
        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-gray-700">Pay Period Start Anchor Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="h-14 justify-center rounded-xl border border-gray-200 bg-white px-4 active:bg-gray-50"
          >
            <Text className="text-base text-gray-900">
              {format(parseISO(form.payPeriodStartDate), 'EEEE, MMM d, yyyy')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={parseISO(form.payPeriodStartDate)}
              mode="date"
              display="default"
              onValueChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  handleChange('payPeriodStartDate', format(selectedDate, 'yyyy-MM-dd'));
                }
              }}
            />
          )}
        </View>

        <Input
          label="Week Starts On (0=Sun, 1=Mon...)"
          value={String(form.weekStartDay)}
          onChangeText={(v) => handleChange('weekStartDay', v)}
          keyboardType="number-pad"
        />

        <Text className="mb-4 mt-4 text-xl font-bold text-gray-900">Shift Defaults & Labels</Text>
        
        {/* Morning Shift */}
        <View className="mb-4 bg-white p-4 rounded-xl border border-gray-200">
          <Text className="font-bold text-blue-600 mb-3 uppercase tracking-wider text-xs">Morning Shift</Text>
          <Input
            label="Display Label"
            value={form.morningShiftLabel}
            onChangeText={(v) => handleChange('morningShiftLabel', v)}
          />
          <View className="flex-row gap-4">
            <View className="flex-1 mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">Start Time</Text>
              <TouchableOpacity
                onPress={() => setShowMorningTimePicker(true)}
                className="h-14 justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 active:bg-gray-100"
              >
                <Text className="text-base text-gray-900">
                  {format(parseTimeStringToDate(form.morningShiftStart), 'h:mm a')}
                </Text>
              </TouchableOpacity>
              {showMorningTimePicker && (
                <DateTimePicker
                  value={parseTimeStringToDate(form.morningShiftStart)}
                  mode="time"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowMorningTimePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      handleChange('morningShiftStart', formatTimeToStr(selectedDate));
                    }
                  }}
                />
              )}
            </View>
            <Input
              className="flex-1"
              label="Duration (hrs)"
              value={String(form.morningShiftDuration)}
              onChangeText={(v) => handleChange('morningShiftDuration', v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Afternoon Shift */}
        <View className="mb-4 bg-white p-4 rounded-xl border border-gray-200">
          <Text className="font-bold text-orange-600 mb-3 uppercase tracking-wider text-xs">Afternoon Shift</Text>
          <Input
            label="Display Label"
            value={form.afternoonShiftLabel}
            onChangeText={(v) => handleChange('afternoonShiftLabel', v)}
          />
          <View className="flex-row gap-4">
            <View className="flex-1 mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">Start Time</Text>
              <TouchableOpacity
                onPress={() => setShowAfternoonTimePicker(true)}
                className="h-14 justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 active:bg-gray-100"
              >
                <Text className="text-base text-gray-900">
                  {format(parseTimeStringToDate(form.afternoonShiftStart), 'h:mm a')}
                </Text>
              </TouchableOpacity>
              {showAfternoonTimePicker && (
                <DateTimePicker
                  value={parseTimeStringToDate(form.afternoonShiftStart)}
                  mode="time"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowAfternoonTimePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      handleChange('afternoonShiftStart', formatTimeToStr(selectedDate));
                    }
                  }}
                />
              )}
            </View>
            <Input
              className="flex-1"
              label="Duration (hrs)"
              value={String(form.afternoonShiftDuration)}
              onChangeText={(v) => handleChange('afternoonShiftDuration', v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Night Shift */}
        <View className="mb-4 bg-white p-4 rounded-xl border border-gray-200">
          <Text className="font-bold text-indigo-600 mb-3 uppercase tracking-wider text-xs">Night Shift</Text>
          <Input
            label="Display Label"
            value={form.nightShiftLabel}
            onChangeText={(v) => handleChange('nightShiftLabel', v)}
          />
          <View className="flex-row gap-4">
            <View className="flex-1 mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">Start Time</Text>
              <TouchableOpacity
                onPress={() => setShowNightTimePicker(true)}
                className="h-14 justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 active:bg-gray-100"
              >
                <Text className="text-base text-gray-900">
                  {format(parseTimeStringToDate(form.nightShiftStart), 'h:mm a')}
                </Text>
              </TouchableOpacity>
              {showNightTimePicker && (
                <DateTimePicker
                  value={parseTimeStringToDate(form.nightShiftStart)}
                  mode="time"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowNightTimePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      handleChange('nightShiftStart', formatTimeToStr(selectedDate));
                    }
                  }}
                />
              )}
            </View>
            <Input
              className="flex-1"
              label="Duration (hrs)"
              value={String(form.nightShiftDuration)}
              onChangeText={(v) => handleChange('nightShiftDuration', v)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Custom Shift */}
        <View className="mb-4 bg-white p-4 rounded-xl border border-gray-200">
          <Text className="font-bold text-gray-600 mb-3 uppercase tracking-wider text-xs">Custom Shift</Text>
          <Input
            label="Display Label"
            value={form.customShiftLabel}
            onChangeText={(v) => handleChange('customShiftLabel', v)}
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
            onValueChange={(val) => handleChange('doublePayForPublicHolidays', val)}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={'#ffffff'}
          />
        </View>

        <View className="mt-8 mb-12 gap-4">
          <Button label="Save Settings" onPress={handleSave} />
          <Button label="Reset Defaults" variant="danger" onPress={handleReset} />
        </View>
      </ScrollView>

      {/* CURRENCY SELECTION MODAL */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View
          style={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom }}
          className="flex-1 bg-white"
        >
          {/* Header */}
          <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Select Currency</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCurrencyModal(false);
                setCurrencySearch('');
              }}
              className="px-3 py-1.5 bg-gray-100 rounded-full"
            >
              <Text className="text-sm font-semibold text-gray-600">Close</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="px-6 py-4">
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12">
              <Search size={18} color="#9ca3af" />
              <Input
                className="flex-1 mb-0 h-full border-0 bg-transparent px-2 text-sm"
                placeholder="Search name, code, or symbol..."
                value={currencySearch}
                onChangeText={setCurrencySearch}
                autoFocus={true}
              />
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  handleChange('currency', item.code);
                  setShowCurrencyModal(false);
                  setCurrencySearch('');
                }}
                className={`flex-row items-center justify-between py-4 border-b border-gray-100 ${
                  form.currency === item.code ? 'bg-blue-50/50 px-2 rounded-xl border-b-0' : ''
                }`}
              >
                <View className="flex-1 pr-4">
                  <Text className="text-base font-semibold text-gray-900">
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{item.code}</Text>
                </View>
                <Text
                  className={`text-lg font-bold ${
                    form.currency === item.code ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {item.symbol}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View className="items-center justify-center mt-20">
                <Text className="text-gray-500">No currencies match your search.</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
