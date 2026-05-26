import { View, FlatList, Text } from 'react-native';
import { useShiftStore } from '../../store/useShiftStore';
import { ShiftCard } from '../../components/ShiftCard';
import { Button } from '../../components/Button';
import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';

export default function ShiftsScreen() {
  const shifts = useShiftStore((state) => state.shifts);

  // Sort shifts chronologically (newest first)
  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <FlatList
        data={sortedShifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShiftCard
            shift={item}
            onPress={() => router.push(`/add-shift?id=${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className="mt-20 items-center justify-center">
            <Text className="mb-2 text-xl font-bold text-gray-800">No Shifts Logged</Text>
            <Text className="text-center text-sm text-gray-500">
              You haven't logged any shifts yet. Tap the button below to add your first shift.
            </Text>
          </View>
        )}
      />

      <View className="absolute bottom-6 left-4 right-4">
        <Button
          label="Add Shift"
          onPress={() => router.push('/add-shift')}
          className="shadow-lg shadow-blue-500/30"
          style={{ flexDirection: 'row', alignItems: 'center' }}
        />
      </View>
    </View>
  );
}
