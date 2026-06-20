import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../viewmodel/hooks/useAuth';
import { COLORS, SIZES } from '../../viewmodel/constants/theme';

interface HeaderProps {
  title: string;
  showUserGreeting?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function Header({ 
  title, 
  showUserGreeting = false, 
  onRefresh, 
  isLoading = false 
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      {showUserGreeting ? (
        <View>
          <Text style={styles.welcomeText}>Olá,</Text>
          <Text style={styles.nameText}>{user?.nome || 'Colaborador'}</Text>
        </View>
      ) : (
        <Text style={styles.headerTitle}>{title}</Text>
      )}

      {onRefresh && (
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
          )}
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
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F2F3F2',
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textGrey,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F6F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F3F2',
  }
});
