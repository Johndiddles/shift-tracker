import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useShiftStore } from '../../store/useShiftStore';
import { calculatePeriodSummary, getCurrentPayPeriodBounds } from '../../utils/calculations';
import { SummaryCard } from '../../components/SummaryCard';
import { Button } from '../../components/Button';
import { parseISO, format, subDays, addDays } from 'date-fns';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SummaryScreen() {
  const { shifts, settings, publicHolidays } = useShiftStore();
  const [targetDate, setTargetDate] = useState(new Date());

  const { start: periodStart, end: periodEnd } = useMemo(() => {
    return getCurrentPayPeriodBounds(
      parseISO(settings.payPeriodStartDate),
      settings.payPeriodLengthDays,
      targetDate
    );
  }, [targetDate, settings]);

  const summary = useMemo(() => {
    // We add an extra day to end and sub an extra day to start inside the calculation interval?
    // Actually, start and end are 00:00:00. To include the end day fully, we pass the bounds.
    // The `isWithinInterval` function is inclusive, but for time comparisons it's tricky.
    // Let's set end of period to 23:59:59
    const effectiveEnd = new Date(periodEnd);
    effectiveEnd.setHours(23, 59, 59, 999);
    return calculatePeriodSummary(shifts, periodStart, effectiveEnd, settings, publicHolidays);
  }, [shifts, periodStart, periodEnd, settings, publicHolidays]);

  const handlePrevPeriod = () => {
    setTargetDate((prev) => subDays(prev, settings.payPeriodLengthDays));
  };

  const handleNextPeriod = () => {
    setTargetDate((prev) => addDays(prev, settings.payPeriodLengthDays));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Period Navigation */}
        <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-white p-2 shadow-sm">
          <Button
            label=""
            variant="secondary"
            className="h-10 w-10 px-0 rounded-xl"
            onPress={handlePrevPeriod}
          >
            <ChevronLeft size={20} color="#4b5563" />
          </Button>
          <View className="items-center">
            <Text className="text-xs font-semibold text-gray-500 uppercase">Pay Period</Text>
            <Text className="text-base font-bold text-gray-900">
              {format(periodStart, 'MMM d')} - {format(periodEnd, 'MMM d, yyyy')}
            </Text>
          </View>
          <Button
            label=""
            variant="secondary"
            className="h-10 w-10 px-0 rounded-xl"
            onPress={handleNextPeriod}
          >
            <ChevronRight size={20} color="#4b5563" />
          </Button>
        </View>

        <SummaryCard summary={summary} />

        <View className="mb-6 mt-2">
          <Text className="mb-4 text-lg font-bold text-gray-900">Weekly Breakdown</Text>
          {summary.weeks.map((week, index) => (
            <View key={index} className="mb-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
              <Text className="mb-2 text-sm font-semibold text-gray-500">
                {format(week.weekStart, 'MMM d')} - {format(week.weekEnd, 'MMM d')}
              </Text>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Total Hours</Text>
                  <Text className="text-base font-bold text-gray-900">{week.totalHours.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Regular</Text>
                  <Text className="text-base font-bold text-gray-900">{week.regularHours.toFixed(2)}</Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Overtime</Text>
                  <Text className={`text-base font-bold ${week.overtimeHours > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {week.overtimeHours.toFixed(2)}
                  </Text>
                </View>
                {week.publicHolidayHours > 0 && (
                  <View>
                    <Text className="text-xs text-gray-500">Holiday</Text>
                    <Text className="text-base font-bold text-green-600">
                      {week.publicHolidayHours.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
          {summary.weeks.length === 0 && (
            <Text className="text-center text-sm text-gray-500 italic mt-4">
              No shifts recorded in this period.
            </Text>
          )}
        </View>

        <Button
          label="Export Report"
          onPress={() => router.push(`/export?start=${periodStart.toISOString()}&end=${periodEnd.toISOString()}`)}
          className="mb-8 shadow-lg shadow-blue-500/30"
          disabled={summary.weeks.length === 0}
        />
      </ScrollView>
    </View>
  );
}
