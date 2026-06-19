import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacityProps 
} from 'react-native';
import { COLORS, SIZES } from '../../viewmodel/constants/theme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
}

export function CustomButton({ 
  title, 
  isLoading = false, 
  style, 
  disabled, 
  ...rest 
}: CustomButtonProps) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isButtonDisabled && styles.disabledButton,
        style
      ]}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    height: 67,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2, // shadow for Android
  },
  disabledButton: {
    backgroundColor: '#A0D8B4', // Lighter green for disabled/loading state
  },
  text: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  }
});
