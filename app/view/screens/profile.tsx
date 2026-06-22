import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { COLORS, SIZES } from '../../viewmodel/constants/theme';
import { useAuth } from '../../viewmodel/hooks/useAuth';
import { Header } from '../components/Header';

import { Role } from '../../model/auth';

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Confirmar Saída",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch {
              Alert.alert("Erro", "Não foi possível fazer logout.");
            }
          }
        }
      ]
    );
  };

  const getInitials = () => {
    if (!user) return "C";
    const nome = user.nome || "";
    const sobrenome = user.sobrenome || "";
    if (nome && sobrenome) {
      return (nome.charAt(0) + sobrenome.charAt(0)).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase() || "US";
  };

  const getRoleLabel = (role?: Role) => {
    if (!role) return "Colaborador";
    return role.tipo_role_display || "Colaborador";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header title="Meu Perfil" showUserGreeting={true} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          <Text style={styles.nameText}>
            {user?.nome} {user?.sobrenome}
          </Text>
          <Text style={styles.usernameText}>@{user?.username || 'user'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>

        {/* Informações Pessoais */}
        <Text style={styles.sectionTitle}>Minhas Informações</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textGrey} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>E-mail Registrado</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textGrey} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Nível de Acesso</Text>
              <Text style={styles.infoValue}>{user?.role ? user.role.tipo_role_display.toUpperCase() : 'COLABORADOR'}</Text>
            </View>
          </View>
        </View>

        {/* Opções e Configurações */}
        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.optionsCard}>
          <TouchableOpacity style={styles.optionRow} onPress={() => Alert.alert("Notificações", "Configurações de notificações em breve.")}>
            <View style={styles.optionLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textDark} />
              <Text style={styles.optionText}>Notificações Push</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textGrey} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.optionRow} onPress={() => Alert.alert("Senha", "Redirecionamento para alteração de senha.")}>
            <View style={styles.optionLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textDark} />
              <Text style={styles.optionText}>Alterar Senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textGrey} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.optionRow} onPress={() => Alert.alert("Idioma", "Selecione o idioma de preferência.")}>
            <View style={styles.optionLeft}>
              <Ionicons name="language-outline" size={20} color={COLORS.textDark} />
              <Text style={styles.optionText}>Idioma (Português)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textGrey} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Terminar Sessão</Text>
        </TouchableOpacity>

        {/* App Version Info */}
        <Text style={styles.versionText}>Versão 1.0.0 (Eletro-time)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFA',
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF8F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2.5,
    borderColor: '#D4EFE0',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  usernameText: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginTop: 4,
    fontWeight: '500',
  },
  roleBadge: {
    backgroundColor: '#EBF8F2',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 10,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textGrey,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderGrey,
    marginVertical: 14,
  },
  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    height: 58,
    borderRadius: 20,
    backgroundColor: '#FDECEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FAD4D1',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 10,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textGrey,
    textAlign: 'center',
    marginTop: 10,
  }
});
