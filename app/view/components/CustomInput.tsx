import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../viewmodel/constants/theme';

interface CustomInputProps extends TextInputProps {
  label: string;
  isPassword?: boolean;
  error?: string;
}

export function CustomInput({ 
  label, 
  isPassword = false, 
  error, 
  style, 
  onFocus, 
  onBlur, 
  ...rest 
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.focusedInputWrapper,
        error && styles.errorInputWrapper
      ]}>
        <TextInput
          style={[styles.input, style]}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="#7C7C7C"
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          {...rest}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            style={styles.iconWrapper}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={COLORS.textGrey} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F2',
    height: 58,
    borderRadius: 15,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  focusedInputWrapper: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  errorInputWrapper: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    paddingVertical: 0,
    height: '100%',
  },
  iconWrapper: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  }
});
