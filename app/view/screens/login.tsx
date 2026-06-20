import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableWithoutFeedback, 
  Keyboard, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useAuth } from '../../viewmodel/hooks/useAuth';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { COLORS } from '../../viewmodel/constants/theme';

export default function Login() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    clearError();

    if (!email) {
      setEmailError('O campo e-mail é obrigatório');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Por favor, insira um e-mail válido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('O campo senha é obrigatório');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(email, password);
    } catch (e: any) {
      // The error is already set in the context, we can display an Alert or use the error state
      Alert.alert("Erro de Autenticação", e.message || "Não foi possível realizar o login.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo/Icon Area */}
            <View style={styles.headerContainer}>
              <View style={styles.logoIconContainer}>
                <Text style={styles.logoIcon}>⏰</Text>
              </View>
              <Text style={styles.appName}>Eletro-time</Text>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Entrar</Text>
              <Text style={styles.subtitle}>Insira seu e-mail e senha para acessar o ponto</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <CustomInput
                label="E-mail"
                placeholder="exemplo@email.com"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                keyboardType="email-address"
                autoComplete="email"
              />

              <CustomInput
                label="Senha"
                placeholder="Insira sua senha"
                value={password}
                onChangeText={setPassword}
                error={passwordError}
                isPassword={true}
                autoComplete="password"
              />

              {/* Forgot password */}
              <TouchableOpacity 
                style={styles.forgotContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              {/* Context Error Alert */}
              {error && (
                <View style={styles.errorAlertContainer}>
                  <Text style={styles.errorAlertText}>{error}</Text>
                </View>
              )}

              {/* Login Button */}
              <CustomButton
                title="Entrar"
                onPress={handleLogin}
                isLoading={isLoading}
                style={styles.loginButton}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF8F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D4EFE0',
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textGrey,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  errorAlertContainer: {
    backgroundColor: '#FDE8E8',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDBA74',
    marginBottom: 20,
  },
  errorAlertText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 10,
  }
});
