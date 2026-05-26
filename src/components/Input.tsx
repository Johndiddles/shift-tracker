import { TextInput, TextInputProps, View, Text } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>}
      <TextInput
        className={`h-14 rounded-xl border px-4 text-base text-gray-900 bg-gray-50 focus:border-blue-500 focus:bg-white ${
          error ? 'border-red-500' : 'border-gray-200'
        }`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
