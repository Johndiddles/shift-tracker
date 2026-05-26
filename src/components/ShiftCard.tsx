import { View, Text, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { ShiftEntry } from '../store/useShiftStore';
import { Clock, Calendar } from 'lucide-react-native';

interface ShiftCardProps {
  shift: ShiftEntry;
  onPress?: () => void;
}

export function ShiftCard({ shift, onPress }: ShiftCardProps) {
  const shiftDate = parseISO(shift.date);
  const startTime = parseISO(shift.startTime);
  const endTime = parseISO(shift.endTime);

  const getShiftColor = () => {
    switch (shift.shiftType) {
      case 'MORNING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'AFTERNOON':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NIGHT':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Calendar size={18} color="#6b7280" />
          <Text className="ml-2 text-base font-semibold text-gray-900">
            {format(shiftDate, 'MMM d, yyyy')}
          </Text>
        </View>
        <View className={`rounded-full border px-3 py-1 ${getShiftColor()}`}>
          <Text className="text-xs font-bold uppercase tracking-wider">{shift.shiftType}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Clock size={16} color="#9ca3af" />
          <Text className="ml-2 text-sm text-gray-600">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </Text>
        </View>
        <Text className="text-lg font-bold text-gray-900">{shift.hoursWorked.toFixed(2)} hrs</Text>
      </View>
      
      {shift.notes ? (
        <Text className="mt-2 text-xs text-gray-500 italic" numberOfLines={1}>
          {shift.notes}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
