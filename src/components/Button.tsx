import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function Button({ label, variant = 'primary', isLoading, className = '', children, ...props }: ButtonProps) {
  let bgClass = 'bg-blue-600';
  let textClass = 'text-white';

  if (variant === 'secondary') {
    bgClass = 'bg-gray-200';
    textClass = 'text-gray-800';
  } else if (variant === 'danger') {
    bgClass = 'bg-red-500';
    textClass = 'text-white';
  }

  return (
    <TouchableOpacity
      className={`h-14 items-center justify-center rounded-xl px-4 flex-row ${bgClass} ${
        props.disabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={textClass.includes('white') ? '#fff' : '#000'} />
      ) : children ? (
        children
      ) : (
        <Text className={`text-base font-semibold ${textClass}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
