import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { api } from '../../viewmodel/helper/api';
import { COLORS, SIZES } from '../../viewmodel/constants/theme';
import { Header } from '../components/Header';

export default function Home() {
  
  // States for API data
  const [horario, setHorario] = useState<any>({ entry: '09:00', exit: '18:00', total: '8h' });
  const [resumo, setResumo] = useState<any>({ hoursWorked: '0h 00m', presenceCount: 0, efficiency: '100%' });
  const [almoco, setAlmoco] = useState<any>({ inProgress: false, duration: '0m' });
  
  const [status, setStatus] = useState<'FORA' | 'TRABALHANDO' | 'ALMOCO'>('FORA');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Time updater
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const [resHorario, resResumo, resAlmoco] = await Promise.all([
        api.get('/api/colaborador/meu_horario/').catch(() => null),
        api.get('/api/colaborador/meu_resumo/').catch(() => null),
        api.get('/api/colaborador/meu_almoco/').catch(() => null)
      ]);

      if (resHorario) setHorario(resHorario);
      if (resResumo) setResumo(resResumo);
      if (resAlmoco) {
        setAlmoco(resAlmoco);
        if (resAlmoco.inProgress) setStatus('ALMOCO');
      }
    } catch {
      console.log('Utilizando dados simulados para a inicialização');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Actions
  const handleMarcarPresenca = async (externa: boolean = false) => {
    setActionLoading(true);
    const endpoint = externa ? '/api/colaborador/marcar_presenca_fora/' : '/api/colaborador/marcar_presenca/';
    try {
      await api.post(endpoint, {
        timestamp: new Date().toISOString(),
        latitude: 0,
        longitude: 0
      });
      
      const newStatus = status === 'FORA' ? 'TRABALHANDO' : 'FORA';
      setStatus(newStatus);
      Alert.alert(
        'Ponto Registrado', 
        `Ponto de ${newStatus === 'TRABALHANDO' ? 'Entrada' : 'Saída'} marcado com sucesso! (${externa ? 'Externo' : 'Interno'})`
      );
      loadData();
    } catch {
      // Fallback response simulation for offline/undefined endpoints
      const newStatus = status === 'FORA' ? 'TRABALHANDO' : 'FORA';
      setStatus(newStatus);
      Alert.alert(
        'Ponto Registrado (Simulado)', 
        `Ponto de ${newStatus === 'TRABALHANDO' ? 'Entrada' : 'Saída'} marcado com sucesso! (${externa ? 'Externo' : 'Interno'})`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAlmoco = async () => {
    setActionLoading(true);
    try {
      await api.post('/api/colaborador/iniciar_almoco/', {
        timestamp: new Date().toISOString()
      });
      
      const isStarting = status !== 'ALMOCO';
      setStatus(isStarting ? 'ALMOCO' : 'TRABALHANDO');
      setAlmoco({ inProgress: isStarting, duration: isStarting ? '0m' : '1h' });
      Alert.alert('Almoço', isStarting ? 'Horário de almoço iniciado!' : 'Horário de almoço finalizado!');
      loadData();
    } catch {
      // Fallback response simulation
      const isStarting = status !== 'ALMOCO';
      setStatus(isStarting ? 'ALMOCO' : 'TRABALHANDO');
      setAlmoco({ inProgress: isStarting, duration: isStarting ? '0m' : '1h' });
      Alert.alert('Almoço (Simulado)', isStarting ? 'Horário de almoço iniciado!' : 'Horário de almoço finalizado!');
    } finally {
      setActionLoading(false);
    }
  };

  // Format time display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getStatusColor = () => {
    switch (status) {
      case 'TRABALHANDO': return COLORS.primary;
      case 'ALMOCO': return '#E6A23C'; // Orange/yellow
      default: return COLORS.textGrey;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'TRABALHANDO': return 'Trabalhando';
      case 'ALMOCO': return 'Em Almoço';
      default: return 'Fora de Serviço';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title="Início" 
        showUserGreeting={true} 
        onRefresh={loadData} 
        isLoading={loading} 
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Live Clock Section */}
        <View style={styles.clockCard}>
          <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.statusIndicatorContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusLabel()}</Text>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              status === 'TRABALHANDO' && styles.actionButtonActive
            ]}
            onPress={() => handleMarcarPresenca(false)}
            disabled={actionLoading || status === 'ALMOCO'}
          >
            <Ionicons 
              name={status === 'TRABALHANDO' ? "log-out" : "log-in"} 
              size={28} 
              color={status === 'TRABALHANDO' ? COLORS.white : COLORS.primary} 
            />
            <Text style={[
              styles.actionButtonText,
              status === 'TRABALHANDO' && styles.actionButtonTextActive
            ]}>
              {status === 'TRABALHANDO' ? 'Registrar Saída' : 'Registrar Entrada'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={() => handleMarcarPresenca(true)}
            disabled={actionLoading || status === 'ALMOCO' || status === 'TRABALHANDO'}
          >
            <Ionicons name="map-outline" size={28} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Ponto Externo</Text>
          </TouchableOpacity>
        </View>

        {/* Lunch break button */}
        {status !== 'FORA' && (
          <TouchableOpacity 
            style={[
              styles.lunchButton, 
              status === 'ALMOCO' && styles.lunchButtonActive
            ]}
            onPress={handleAlmoco}
            disabled={actionLoading}
          >
            <Ionicons 
              name="restaurant-outline" 
              size={24} 
              color={status === 'ALMOCO' ? COLORS.white : '#E6A23C'} 
            />
            <Text style={[
              styles.lunchButtonText,
              status === 'ALMOCO' && styles.lunchButtonTextActive
            ]}>
              {status === 'ALMOCO' ? 'Retornar do Almoço' : 'Iniciar Almoço'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Horário e Escala Section */}
        <Text style={styles.sectionTitle}>Escala de Hoje</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.infoBlock}>
              <Ionicons name="time-outline" size={20} color={COLORS.textGrey} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Entrada / Saída</Text>
                <Text style={styles.infoValue}>{horario.entry} - {horario.exit}</Text>
              </View>
            </View>
            <View style={styles.infoBlock}>
              <Ionicons name="cafe-outline" size={20} color={COLORS.textGrey} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Almoço</Text>
                <Text style={styles.infoValue}>{almoco.duration || '1h'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resumo da Jornada */}
        <Text style={styles.sectionTitle}>Meu Resumo</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Horas Hoje</Text>
            <Text style={styles.statValue}>{resumo.hoursWorked}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dias Pontuais</Text>
            <Text style={styles.statValue}>{resumo.presenceCount}</Text>
          </View>
        </View>
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
  clockCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#EAF6EE',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textGrey,
    textTransform: 'capitalize',
    fontWeight: '500',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: '#F4F5F4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    height: 94,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#EAF6EE',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  actionButtonOutline: {
    marginLeft: 10,
    marginRight: 0,
  },
  actionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 8,
  },
  actionButtonTextActive: {
    color: COLORS.white,
  },
  lunchButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF0',
    borderWidth: 1.5,
    borderColor: '#FFECC0',
    borderRadius: 20,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lunchButtonActive: {
    backgroundColor: '#E6A23C',
    borderColor: '#E6A23C',
  },
  lunchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E6A23C',
    marginLeft: 10,
  },
  lunchButtonTextActive: {
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  }
});