import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { COLORS, SIZES } from '../../viewmodel/constants/theme';
import { useAuth } from '../../viewmodel/hooks/useAuth';

interface HeaderProps {
  title?: string;
  showUserGreeting?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
}

export function Header({ 
  title = "Início",
  showUserGreeting = false,
  onRefresh,
  isLoading = false,
  onMenuPress, 
  onProfilePress
}: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogoutPress = () => {
    Alert.alert(
      "Confirmar Saída",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: logout }
      ]
    );
  };

  // If showUserGreeting is true, render the redesigned home-style header (from the fitness mock)
  if (showUserGreeting) {
    return (
      <View style={styles.header}>
        {/* Grouped Avatar and Greeting Container */}
        <TouchableOpacity 
          onPress={onProfilePress}
          style={styles.profileAndGreetingContainer}
          activeOpacity={0.8}
        >
          <View style={styles.profileContainer}>
            <Ionicons name="person-circle-outline" size={38} color={COLORS.white} style={styles.profileIcon} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.welcomeText}>Olá, {user?.nome || "Colaborador"}</Text>
          </View>
        </TouchableOpacity>

        {/* Logout Button on the Right */}
        <TouchableOpacity 
          onPress={handleLogoutPress} 
          style={styles.refreshButton}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  }

  // Otherwise, render the standard page header (compatible with calendar, documents, finances, etc.)
  return (
    <View style={styles.standardHeader}>
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Render Logout by default, or Refresh if onRefresh is passed */}
      {onRefresh ? (
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Ionicons name="sync-outline" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleLogoutPress} style={styles.refreshButton}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.primary, // Light Blue Theme
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  standardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: COLORS.primary, // Light Blue Theme
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  profileAndGreetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Spacing between avatar and name text
  },
  profileIcon: {
    alignSelf: 'center',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white, // White text
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white, // White text
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Premium transparent white background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  }
});
