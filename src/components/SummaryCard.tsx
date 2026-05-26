import { View, Text } from 'react-native';
import { PeriodSummary } from '../utils/calculations';

interface SummaryCardProps {
  summary: PeriodSummary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <View className="rounded-3xl bg-blue-600 p-6 shadow-md mb-6">
      <Text className="mb-4 text-sm font-medium text-blue-100 uppercase tracking-widest">
        Period Summary
      </Text>
      
      <View className="mb-6 flex-row items-end">
        <Text className="text-4xl font-extrabold text-white">
          ${summary.estimatedTotalPay.toFixed(2)}
        </Text>
        <Text className="mb-1 ml-2 text-sm font-medium text-blue-200">
          Est. Pay
        </Text>
      </View>

      <View className="flex-row justify-between rounded-2xl bg-blue-700/50 p-4">
        <View className="items-center">
          <Text className="text-xs font-medium text-blue-200">Total Hours</Text>
          <Text className="mt-1 text-lg font-bold text-white">{summary.totalHours.toFixed(2)}</Text>
        </View>
        <View className="h-full w-px bg-blue-500/50" />
        <View className="items-center">
          <Text className="text-xs font-medium text-blue-200">Regular</Text>
          <Text className="mt-1 text-lg font-bold text-white">{summary.regularHours.toFixed(2)}</Text>
        </View>
        <View className="h-full w-px bg-blue-500/50" />
        <View className="items-center">
          <Text className="text-xs font-medium text-red-200">Overtime</Text>
          <Text className={`mt-1 text-lg font-bold ${summary.overtimeHours > 0 ? 'text-red-200' : 'text-white'}`}>
            {summary.overtimeHours.toFixed(2)}
          </Text>
        </View>
        <View className="h-full w-px bg-blue-500/50" />
        <View className="items-center">
          <Text className="text-xs font-medium text-green-200">Holiday</Text>
          <Text className={`mt-1 text-lg font-bold ${summary.publicHolidayHours > 0 ? 'text-green-200' : 'text-white'}`}>
            {summary.publicHolidayHours.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
