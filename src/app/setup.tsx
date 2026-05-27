import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShiftStore } from '../store/useShiftStore';
import { CURRENCIES, getCurrency } from '../constants/currencies';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import {
  User,
  CreditCard,
  Clock,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  HelpCircle,
} from 'lucide-react-native';

export default function SetupScreen() {
  const insets = useSafeAreaInsets();
  const { updateSettings, setSetupComplete } = useShiftStore();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Personal Info & Currency
  const [employeeName, setEmployeeName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Step 2: Pay Configuration
  const [regularHourlyRate, setRegularHourlyRate] = useState('20.00');
  const [overtimeHourlyRate, setOvertimeHourlyRate] = useState('30.00');
  const [payPeriodLengthDays, setPayPeriodLengthDays] = useState('14');
  const [payPeriodStartDate, setPayPeriodStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weekStartDay, setWeekStartDay] = useState<'0' | '1' | '2' | '3' | '4' | '5' | '6'>('0'); // String for input state

  // Step 3: Shift Defaults & Labels
  const [morningLabel, setMorningLabel] = useState('Morning');
  const [morningStart, setMorningStart] = useState('07:00');
  const [morningDuration, setMorningDuration] = useState('8.0');

  const [afternoonLabel, setAfternoonLabel] = useState('Afternoon');
  const [afternoonStart, setAfternoonStart] = useState('15:00');
  const [afternoonDuration, setAfternoonDuration] = useState('8.0');

  const [nightLabel, setNightLabel] = useState('Night');
  const [nightStart, setNightStart] = useState('23:00');
  const [nightDuration, setNightDuration] = useState('8.0');

  const [customLabel, setCustomLabel] = useState('Custom');

  // Step 4: Policies & Finish
  const [doublePayForPublicHolidays, setDoublePayForPublicHolidays] = useState(false);

  const selectedCurrencyInfo = getCurrency(currency);

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.includes(currencySearch)
  );

  const handleNext = () => {
    if (step === 1) {
      if (!employeeName.trim()) {
        Alert.alert('Name Required', 'Please enter your name to proceed.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const reg = parseFloat(regularHourlyRate);
      const ot = parseFloat(overtimeHourlyRate);
      const len = parseInt(payPeriodLengthDays, 10);
      const ws = parseInt(weekStartDay, 10);

      if (isNaN(reg) || reg < 0) {
        Alert.alert('Invalid Input', 'Please enter a valid regular hourly rate.');
        return;
      }
      if (isNaN(ot) || ot < 0) {
        Alert.alert('Invalid Input', 'Please enter a valid overtime hourly rate.');
        return;
      }
      if (isNaN(len) || len <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid pay period length in days.');
        return;
      }
      if (isNaN(ws) || ws < 0 || ws > 6) {
        Alert.alert('Invalid Input', 'Week Start Day must be between 0 (Sunday) and 6 (Saturday).');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const morningDur = parseFloat(morningDuration);
      const afternoonDur = parseFloat(afternoonDuration);
      const nightDur = parseFloat(nightDuration);

      if (!morningLabel.trim()) {
        Alert.alert('Label Required', 'Please specify a label for the morning shift.');
        return;
      }
      if (!afternoonLabel.trim()) {
        Alert.alert('Label Required', 'Please specify a label for the afternoon shift.');
        return;
      }
      if (!nightLabel.trim()) {
        Alert.alert('Label Required', 'Please specify a label for the night shift.');
        return;
      }
      if (!customLabel.trim()) {
        Alert.alert('Label Required', 'Please specify a label for the custom shift.');
        return;
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(morningStart) || !timeRegex.test(afternoonStart) || !timeRegex.test(nightStart)) {
        Alert.alert('Invalid Time Format', 'Shift starts must be in HH:MM 24-hour format (e.g. 08:30 or 17:00).');
        return;
      }

      if (isNaN(morningDur) || morningDur <= 0 || morningDur > 24) {
        Alert.alert('Invalid Duration', 'Morning shift duration must be between 0 and 24 hours.');
        return;
      }
      if (isNaN(afternoonDur) || afternoonDur <= 0 || afternoonDur > 24) {
        Alert.alert('Invalid Duration', 'Afternoon shift duration must be between 0 and 24 hours.');
        return;
      }
      if (isNaN(nightDur) || nightDur <= 0 || nightDur > 24) {
        Alert.alert('Invalid Duration', 'Night shift duration must be between 0 and 24 hours.');
        return;
      }

      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const reg = parseFloat(regularHourlyRate);
    const ot = parseFloat(overtimeHourlyRate);
    const len = parseInt(payPeriodLengthDays, 10);
    const ws = parseInt(weekStartDay, 10);
    const morningDur = parseFloat(morningDuration);
    const afternoonDur = parseFloat(afternoonDuration);
    const nightDur = parseFloat(nightDuration);

    updateSettings({
      employeeName: employeeName.trim(),
      currency,
      regularHourlyRate: reg,
      overtimeHourlyRate: ot,
      payPeriodLengthDays: len,
      payPeriodStartDate: format(payPeriodStartDate, 'yyyy-MM-dd'),
      weekStartDay: ws as any,
      doublePayForPublicHolidays,
      morningShiftLabel: morningLabel.trim(),
      morningShiftStart: morningStart,
      morningShiftDuration: morningDur,
      afternoonShiftLabel: afternoonLabel.trim(),
      afternoonShiftStart: afternoonStart,
      afternoonShiftDuration: afternoonDur,
      nightShiftLabel: nightLabel.trim(),
      nightShiftStart: nightStart,
      nightShiftDuration: nightDur,
      customShiftLabel: customLabel.trim(),
    });

    setSetupComplete(true);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View
        className="flex-1"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        {/* Progress Bar & Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-extrabold text-gray-900 tracking-tight">
              App Setup
            </Text>
            <Text className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Step {step} of {totalSteps}
            </Text>
          </View>
          {/* Step indicator bar */}
          <View className="h-1.5 w-full bg-gray-100 rounded-full mt-4 flex-row overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                className={`h-full flex-1 ${
                  i <= step ? 'bg-blue-600' : 'bg-gray-100'
                } ${i > 1 ? 'ml-1' : ''}`}
              />
            ))}
          </View>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* STEP 1: WELCOME & IDENTITY */}
          {step === 1 && (
            <View className="pt-6">
              <View className="items-center mb-6">
                <View className="h-20 w-20 bg-blue-100 rounded-3xl items-center justify-center mb-4">
                  <User size={40} color="#2563eb" />
                </View>
                <Text className="text-xl font-bold text-center text-gray-900">
                  Welcome to Shift Tracker!
                </Text>
                <Text className="text-sm text-center text-gray-500 mt-2">
                  Let's configure the app to match your workplace setup.
                </Text>
              </View>

              <Input
                label="Your Name"
                value={employeeName}
                onChangeText={setEmployeeName}
                placeholder="e.g. John Doe"
                autoCapitalize="words"
              />

              <Text className="mb-2 text-sm font-medium text-gray-700 mt-2">
                Work Currency
              </Text>
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(true)}
                className="h-14 flex-row items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 mb-4 active:bg-gray-100"
              >
                <View className="flex-row items-center">
                  <Globe size={20} color="#4b5563" />
                  <Text className="ml-3 text-base text-gray-900 font-semibold">
                    {selectedCurrencyInfo.name} ({selectedCurrencyInfo.code})
                  </Text>
                </View>
                <Text className="text-xl font-bold text-blue-600">
                  {selectedCurrencyInfo.symbol}
                </Text>
              </TouchableOpacity>

              <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-4 flex-row">
                <HelpCircle size={20} color="#d97706" className="shrink-0 mt-0.5" />
                <View className="ml-3 flex-1">
                  <Text className="text-xs font-semibold text-amber-800">
                    Why is this needed?
                  </Text>
                  <Text className="text-xs text-amber-700 mt-1 leading-relaxed">
                    We use your name in exported PDFs and invoices, and currency formats calculations
                    across all summary boards.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* STEP 2: PAY CONFIGURATION */}
          {step === 2 && (
            <View className="pt-6">
              <View className="items-center mb-6">
                <View className="h-16 w-16 bg-emerald-100 rounded-3xl items-center justify-center mb-4">
                  <CreditCard size={32} color="#059669" />
                </View>
                <Text className="text-xl font-bold text-center text-gray-900">
                  Pay Configurations
                </Text>
                <Text className="text-sm text-center text-gray-500 mt-2">
                  Configure hourly rates and payroll structures in {selectedCurrencyInfo.code} ({selectedCurrencyInfo.symbol}).
                </Text>
              </View>

              <Input
                label={`Regular Hourly Rate (${selectedCurrencyInfo.symbol})`}
                value={regularHourlyRate}
                onChangeText={setRegularHourlyRate}
                keyboardType="decimal-pad"
                placeholder="20.00"
              />

              <Input
                label={`Overtime Hourly Rate (${selectedCurrencyInfo.symbol})`}
                value={overtimeHourlyRate}
                onChangeText={setOvertimeHourlyRate}
                keyboardType="decimal-pad"
                placeholder="30.00"
              />

              <View className="flex-row gap-4">
                <Input
                  className="flex-1"
                  label="Pay Cycle Length (Days)"
                  value={payPeriodLengthDays}
                  onChangeText={setPayPeriodLengthDays}
                  keyboardType="number-pad"
                  placeholder="14"
                />
                <View className="flex-1 mb-4">
                  <Text className="mb-2 text-sm font-medium text-gray-700">Week Starts On</Text>
                  <View className="flex-row rounded-xl border border-gray-200 overflow-hidden h-14 bg-gray-50">
                    <TouchableOpacity
                      onPress={() => setWeekStartDay('0')}
                      className={`flex-1 items-center justify-center ${
                        weekStartDay === '0' ? 'bg-blue-600' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          weekStartDay === '0' ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        Sun
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setWeekStartDay('1')}
                      className={`flex-1 items-center justify-center ${
                        weekStartDay === '1' ? 'bg-blue-600' : ''
                      }`}
                    >
                      <Text
                        className={`text-sm font-bold ${
                          weekStartDay === '1' ? 'text-white' : 'text-gray-600'
                        }`}
                      >
                        Mon
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Text className="mb-2 text-sm font-medium text-gray-700">
                Pay Period Anchor Start Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="h-14 justify-center rounded-xl border border-gray-200 bg-gray-50 px-4"
              >
                <Text className="text-base text-gray-900 font-semibold">
                  {format(payPeriodStartDate, 'EEEE, MMM d, yyyy')}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={payPeriodStartDate}
                  mode="date"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) setPayPeriodStartDate(selectedDate);
                  }}
                />
              )}
            </View>
          )}

          {/* STEP 3: SHIFT DEFAULT CONFIGS & LABELS */}
          {step === 3 && (
            <View className="pt-6">
              <View className="items-center mb-6">
                <View className="h-16 w-16 bg-purple-100 rounded-3xl items-center justify-center mb-4">
                  <Clock size={32} color="#7c3aed" />
                </View>
                <Text className="text-xl font-bold text-center text-gray-900">
                  Shift Defaults & Custom Labels
                </Text>
                <Text className="text-sm text-center text-gray-500 mt-2">
                  Customize the labels, start times, and durations of shifts.
                </Text>
              </View>

              {/* MORNING SHIFT */}
              <View className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 mb-4">
                <Text className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">
                  Morning Shift Setup
                </Text>
                <Input
                  label="Display Label"
                  value={morningLabel}
                  onChangeText={setMorningLabel}
                  placeholder="Morning"
                />
                <View className="flex-row gap-4">
                  <Input
                    className="flex-1"
                    label="Start Time (HH:MM)"
                    value={morningStart}
                    onChangeText={setMorningStart}
                    placeholder="07:00"
                  />
                  <Input
                    className="flex-1"
                    label="Duration (Hours)"
                    value={morningDuration}
                    onChangeText={setMorningDuration}
                    keyboardType="decimal-pad"
                    placeholder="8.0"
                  />
                </View>
              </View>

              {/* AFTERNOON SHIFT */}
              <View className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 mb-4">
                <Text className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wide">
                  Afternoon Shift Setup
                </Text>
                <Input
                  label="Display Label"
                  value={afternoonLabel}
                  onChangeText={setAfternoonLabel}
                  placeholder="Afternoon"
                />
                <View className="flex-row gap-4">
                  <Input
                    className="flex-1"
                    label="Start Time (HH:MM)"
                    value={afternoonStart}
                    onChangeText={setAfternoonStart}
                    placeholder="15:00"
                  />
                  <Input
                    className="flex-1"
                    label="Duration (Hours)"
                    value={afternoonDuration}
                    onChangeText={setAfternoonDuration}
                    keyboardType="decimal-pad"
                    placeholder="8.0"
                  />
                </View>
              </View>

              {/* NIGHT SHIFT */}
              <View className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 mb-4">
                <Text className="text-sm font-bold text-indigo-600 mb-2 uppercase tracking-wide">
                  Night Shift Setup
                </Text>
                <Input
                  label="Display Label"
                  value={nightLabel}
                  onChangeText={setNightLabel}
                  placeholder="Night"
                />
                <View className="flex-row gap-4">
                  <Input
                    className="flex-1"
                    label="Start Time (HH:MM)"
                    value={nightStart}
                    onChangeText={setNightStart}
                    placeholder="23:00"
                  />
                  <Input
                    className="flex-1"
                    label="Duration (Hours)"
                    value={nightDuration}
                    onChangeText={setNightDuration}
                    keyboardType="decimal-pad"
                    placeholder="8.0"
                  />
                </View>
              </View>

              {/* CUSTOM SHIFT */}
              <View className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                <Text className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  Custom Shift Setup
                </Text>
                <Input
                  label="Display Label"
                  value={customLabel}
                  onChangeText={setCustomLabel}
                  placeholder="Custom"
                />
              </View>
            </View>
          )}

          {/* STEP 4: REVIEW & POLICIES */}
          {step === 4 && (
            <View className="pt-6">
              <View className="items-center mb-6">
                <View className="h-16 w-16 bg-blue-100 rounded-3xl items-center justify-center mb-4">
                  <Check size={32} color="#2563eb" />
                </View>
                <Text className="text-xl font-bold text-center text-gray-900">
                  Review & Complete
                </Text>
                <Text className="text-sm text-center text-gray-500 mt-2">
                  Review your settings below and set your overtime policies.
                </Text>
              </View>

              <View className="border border-gray-100 rounded-2xl p-5 bg-gray-50 mb-6">
                <Text className="text-base font-bold text-gray-800 mb-3">Setup Summary</Text>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-500">Name</Text>
                  <Text className="text-sm font-bold text-gray-900">{employeeName}</Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-500">Currency</Text>
                  <Text className="text-sm font-bold text-gray-900">
                    {selectedCurrencyInfo.name} ({selectedCurrencyInfo.code} - {selectedCurrencyInfo.symbol})
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-500">Regular Pay</Text>
                  <Text className="text-sm font-bold text-gray-900">
                    {selectedCurrencyInfo.symbol}
                    {parseFloat(regularHourlyRate).toFixed(2)}/hr
                  </Text>
                </View>
                <View className="flex-row justify-between py-2 border-b border-gray-100">
                  <Text className="text-sm text-gray-500">Overtime Pay</Text>
                  <Text className="text-sm font-bold text-gray-900">
                    {selectedCurrencyInfo.symbol}
                    {parseFloat(overtimeHourlyRate).toFixed(2)}/hr
                  </Text>
                </View>
                <View className="flex-row justify-between py-2">
                  <Text className="text-sm text-gray-500">Shifts Labels</Text>
                  <Text className="text-sm font-bold text-gray-900">
                    {morningLabel}, {afternoonLabel}, {nightLabel}
                  </Text>
                </View>
              </View>

              <Text className="mb-3 text-lg font-bold text-gray-900">Holiday Policy</Text>
              <View className="flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
                <View className="flex-1 pr-4">
                  <Text className="font-semibold text-gray-900 text-sm">Double Pay for Holidays</Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    Log hours worked on public holidays at 2x rate.
                  </Text>
                </View>
                <Switch
                  value={doublePayForPublicHolidays}
                  onValueChange={setDoublePayForPublicHolidays}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={'#ffffff'}
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM NAVIGATION ACTIONS */}
        <View className="px-6 py-4 flex-row gap-4 border-t border-gray-100 bg-white">
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              className="h-14 flex-row items-center justify-center rounded-xl bg-gray-100 px-6"
            >
              <ChevronLeft size={20} color="#1f2937" />
              <Text className="ml-1 text-base font-bold text-gray-800">Back</Text>
            </TouchableOpacity>
          )}

          {step < totalSteps ? (
            <TouchableOpacity
              onPress={handleNext}
              className="h-14 flex-1 flex-row items-center justify-center rounded-xl bg-blue-600"
            >
              <Text className="text-base font-bold text-white mr-1">Continue</Text>
              <ChevronRight size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleFinish}
              className="h-14 flex-1 flex-row items-center justify-center rounded-xl bg-blue-600"
            >
              <Text className="text-base font-bold text-white mr-1">Complete Setup</Text>
              <Check size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CURRENCY SELECTION MODAL */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
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
                  setCurrency(item.code);
                  setShowCurrencyModal(false);
                  setCurrencySearch('');
                }}
                className={`flex-row items-center justify-between py-4 border-b border-gray-100 ${
                  currency === item.code ? 'bg-blue-50/50 px-2 rounded-xl border-b-0' : ''
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
                    currency === item.code ? 'text-blue-600' : 'text-gray-400'
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
    </KeyboardAvoidingView>
  );
}
