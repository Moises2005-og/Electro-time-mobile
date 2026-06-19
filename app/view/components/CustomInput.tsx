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
          placeholderTextColor="#B1B1B1"
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textGrey,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGrey,
    paddingBottom: 8,
  },
  focusedInputWrapper: {
    borderBottomColor: COLORS.primary,
  },
  errorInputWrapper: {
    borderBottomColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: COLORS.textDark,
    paddingVertical: 4,
  },
  iconWrapper: {
    padding: 4,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 5,
  }
});
