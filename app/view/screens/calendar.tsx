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

export default function Calendar() {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // States
  const [calendario, setCalendario] = useState<any[]>([
    { dia: '15', diaSemana: 'Seg', status: 'PRESENTE' },
    { dia: '16', diaSemana: 'Ter', status: 'PRESENTE' },
    { dia: '17', diaSemana: 'Qua', status: 'PRESENTE' },
    { dia: '18', diaSemana: 'Qui', status: 'ATRASO' },
    { dia: '19', diaSemana: 'Sex', status: 'FOLGA' },
    { dia: '20', diaSemana: 'Sáb', status: 'FOLGA' },
    { dia: '21', diaSemana: 'Dom', status: 'FOLGA' },
  ]);

  const [ferias, setFerias] = useState<any>({
    disponiveis: 15,
    gozados: 7,
    totais: 22,
    solicitacoes: [
      { id: '1', periodo: '01/08/2026 a 10/08/2026', dias: 10, status: 'APROVADO' },
      { id: '2', periodo: '15/12/2026 a 20/12/2026', dias: 5, status: 'PENDENTE' }
    ]
  });

  const [atrasos, setAtrasos] = useState<any[]>([
    { id: '1', data: '2026-06-18', minutos: 15, justificativa: 'Trânsito intenso' },
    { id: '2', data: '2026-06-08', minutos: 20, justificativa: 'Atraso comboio' },
  ]);

  const [tarefas, setTarefas] = useState<any[]>([
    { id: '1', titulo: 'Verificar inventário de lâmpadas', concluida: false },
    { id: '2', titulo: 'Preencher folha de ponto semanal', concluida: true },
    { id: '3', titulo: 'Realizar manutenção no quadro principal', concluida: false },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resCalendario, resFerias, resAtrasos] = await Promise.all([
        api.get('/api/colaborador/meu_calendario/').catch(() => null),
        api.get('/api/colaborador/minhas_ferias/').catch(() => null),
        api.get('/api/colaborador/meus_atrasos/').catch(() => null)
      ]);

      if (resCalendario && Array.isArray(resCalendario)) setCalendario(resCalendario);
      if (resFerias) setFerias(resFerias);
      if (resAtrasos && Array.isArray(resAtrasos)) setAtrasos(resAtrasos);
    } catch {
      console.log('Utilizando dados simulados para o calendário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTarefa = async (id: string, concluidaAtualmente: boolean) => {
    setActionLoading(true);
    try {
      await api.post('/api/colaborador/marcar_tarefa_concluida/', { id, concluida: !concluidaAtualmente });
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida: !concluidaAtualmente } : t));
      Alert.alert("Sucesso", "Status da tarefa atualizado!");
    } catch {
      // Simulation
      setTarefas(prev => prev.map(t => t.id === id ? { ...t, concluida: !concluidaAtualmente } : t));
      Alert.alert("Sucesso (Simulado)", "Status da tarefa atualizado!");
    } finally {
      setActionLoading(false);
    }
  };

  const getCalendarStatusStyle = (status: string) => {
    switch (status) {
      case 'PRESENTE': return { bg: '#EBF8F2', color: COLORS.primary };
      case 'ATRASO': return { bg: '#FDECEB', color: COLORS.error };
      case 'FERIAS': return { bg: '#ECF5FF', color: '#409EFF' };
      default: return { bg: '#F4F4F5', color: COLORS.textGrey };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title="Escala & Tarefas" 
        onRefresh={loadData} 
        isLoading={loading} 
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Weekly Calendar Widget */}
        <Text style={styles.sectionTitle}>Escala Semanal</Text>
        <View style={styles.calendarContainer}>
          {calendario.map((item, index) => {
            const styleInfo = getCalendarStatusStyle(item.status);
            return (
              <View key={index} style={styles.calendarDay}>
                <Text style={styles.dayOfWeek}>{item.diaSemana}</Text>
                <View style={[styles.dayCircle, { backgroundColor: styleInfo.bg }]}>
                  <Text style={[styles.dayNumber, { color: styleInfo.color }]}>{item.dia}</Text>
                </View>
                <Text style={styles.dayStatusText}>{item.status === 'FOLGA' ? 'Folga' : item.status === 'ATRASO' ? 'Atraso' : 'Ok'}</Text>
              </View>
            );
          })}
        </View>

        {/* Tarefas Checklist */}
        <Text style={styles.sectionTitle}>Tarefas do Dia</Text>
        <View style={styles.card}>
          {tarefas.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.taskRow}
              onPress={() => handleToggleTarefa(item.id, item.concluida)}
              disabled={actionLoading}
            >
              <Ionicons 
                name={item.concluida ? "checkbox" : "square-outline"} 
                size={24} 
                color={item.concluida ? COLORS.primary : COLORS.borderGrey} 
              />
              <Text style={[
                styles.taskText, 
                item.concluida && styles.taskTextCompleted
              ]}>
                {item.titulo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Férias Panel */}
        <Text style={styles.sectionTitle}>Minhas Férias</Text>
        <View style={styles.card}>
          <View style={styles.vacationSummary}>
            <View style={styles.vacationStat}>
              <Text style={styles.vacationNumber}>{ferias.disponiveis}</Text>
              <Text style={styles.vacationLabel}>Disponíveis</Text>
            </View>
            <View style={styles.vacationStat}>
              <Text style={[styles.vacationNumber, { color: '#E6A23C' }]}>{ferias.gozados}</Text>
              <Text style={styles.vacationLabel}>Gozados</Text>
            </View>
            <View style={styles.vacationStat}>
              <Text style={[styles.vacationNumber, { color: COLORS.textGrey }]}>{ferias.totais}</Text>
              <Text style={styles.vacationLabel}>Total Ano</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.subSectionTitle}>Solicitações Recentes</Text>
          {ferias.solicitacoes.map((s: any) => (
            <View key={s.id} style={styles.solicitacaoItem}>
              <View style={styles.solicitacaoDetails}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.textGrey} />
                <Text style={styles.solicitacaoPeriodo}>{s.periodo}</Text>
              </View>
              <View style={[
                styles.badge, 
                s.status === 'APROVADO' ? styles.badgeSuccess : styles.badgeWarning
              ]}>
                <Text style={[
                  styles.badgeText, 
                  s.status === 'APROVADO' ? styles.badgeTextSuccess : styles.badgeTextWarning
                ]}>
                  {s.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Atrasos Section */}
        <Text style={styles.sectionTitle}>Meus Atrasos</Text>
        {atrasos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.primary} />
            <Text style={styles.emptyText}>Excelente! Nenhum atraso registrado.</Text>
          </View>
        ) : (
          <View style={[styles.card, { borderColor: COLORS.error, borderWidth: 1 }]}>
            <View style={styles.atrasosHeader}>
              <Ionicons name="warning-outline" size={20} color={COLORS.error} />
              <Text style={styles.atrasoTitleText}>Registros de Atraso ({atrasos.length})</Text>
            </View>
            <View style={styles.divider} />
            {atrasos.map((a) => (
              <View key={a.id} style={styles.atrasoItem}>
                <View style={styles.atrasoRow}>
                  <Text style={styles.atrasoData}>
                    {new Date(a.data).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.atrasoMinutos}>+{a.minutos} min</Text>
                </View>
                <Text style={styles.atrasoJustificativa}>Motivo: {a.justificativa}</Text>
              </View>
            ))}
          </View>
        )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  calendarDay: {
    alignItems: 'center',
    flex: 1,
  },
  dayOfWeek: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginBottom: 8,
    fontWeight: '500',
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dayStatusText: {
    fontSize: 10,
    color: COLORS.textGrey,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F5',
  },
  taskText: {
    fontSize: 14,
    color: COLORS.textDark,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textGrey,
  },
  vacationSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vacationStat: {
    alignItems: 'center',
    flex: 1,
  },
  vacationNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  vacationLabel: {
    fontSize: 11,
    color: COLORS.textGrey,
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderGrey,
    marginVertical: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  solicitacaoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  solicitacaoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  solicitacaoPeriodo: {
    fontSize: 13,
    color: COLORS.textDark,
    marginLeft: 8,
    fontWeight: '500',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeSuccess: {
    backgroundColor: '#EBF8F2',
  },
  badgeWarning: {
    backgroundColor: '#FFF9E6',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: COLORS.primary,
  },
  badgeTextWarning: {
    color: '#E6A23C',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginTop: 12,
  },
  atrasosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  atrasoTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 8,
  },
  atrasoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDECEB',
  },
  atrasoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  atrasoData: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  atrasoMinutos: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.error,
  },
  atrasoJustificativa: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginTop: 4,
  }
});
