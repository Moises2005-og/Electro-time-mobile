import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Login from "../../view/screens/login";
import Onboarding from "../../view/screens/onboarding";
import { COLORS } from '../constants/theme';
import { useAuth } from "../hooks/useAuth";
import Layout from "../layout";

const Stack = createNativeStackNavigator();


export default function Navigation() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Splash style loading screen matching Nectar green background */}
        <Text style={styles.logoIcon}>⏰</Text>
        <Text style={styles.logoText}>Eletro-time</Text>
        <ActivityIndicator size="large" color={COLORS.white} style={styles.spinner} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token === null ? (
        <>
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Login" component={Login} />
        </>
      ) : (
        <Stack.Screen
          name="Layout"
          component={Layout}
          options={{ statusBarStyle: "dark" }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 70,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1,
  },
  spinner: {
    marginTop: 30,
  }
});