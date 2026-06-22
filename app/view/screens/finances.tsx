import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
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
import { api } from '../../viewmodel/helper/api';
import { useAuth } from '../../viewmodel/hooks/useAuth';
import { Header } from '../components/Header';

export default function Finances() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // States
  const [economia, setEconomia] = useState<any>({
    salario: 250000.00,
    gastos: 77500.00,
    sobra: 172500.00,
    status: 'BOM' // BOM (🟢), ATENCAO (🟡), RUIM (🔴)
  });

  const [fugas, setFugas] = useState<any>({
    diaria: 2580.00,
    mensal: 77500.00,
    anual: 930000.00,
    descricao: "Fuga principal: Transporte e alimentação fora de casa."
  });

  const [gastos, setGastos] = useState<any[]>([
    { id: '1', descricao: 'Almoço Restaurante', categoria: 'Alimentação', valor: 7500.00, data: '2026-06-19' },
    { id: '2', descricao: 'Gasolina', categoria: 'Transporte', valor: 25000.00, data: '2026-06-18' },
    { id: '3', descricao: 'Assinatura Software', categoria: 'Serviços', valor: 15000.00, data: '2026-06-15' },
    { id: '4', descricao: 'Cafés Diários', categoria: 'Alimentação', valor: 3000.00, data: '2026-06-14' },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resEconomia, resFugas, resGastos] = await Promise.all([
        api.get('/api/colaborador/minha_economia/').catch(() => null),
        api.get('/api/colaborador/fugas_de_dinheiro/').catch(() => null),
        api.get('/api/colaborador/meus_gastos/').catch(() => null)
      ]);

      if (resEconomia) setEconomia(resEconomia);
      if (resFugas) setFugas(resFugas);
      if (resGastos && Array.isArray(resGastos)) setGastos(resGastos);
    } catch {
      console.log('Utilizando dados simulados para finanças');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteGasto = (id: string) => {
    Alert.alert(
      "Eliminar Gasto",
      "Tem certeza que deseja remover este gasto?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Remover", 
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await api.post('/api/colaborador/eliminar_gasto/', { id });
              setGastos(prev => prev.filter(item => item.id !== id));
              Alert.alert("Sucesso", "Gasto removido com sucesso!");
              loadData();
            } catch {
              // Simulated deletion
              setGastos(prev => prev.filter(item => item.id !== id));
              // Update economia simulation
              const removed = gastos.find(item => item.id === id);
              if (removed) {
                const newGastosVal = economia.gastos - removed.valor;
                setEconomia({
                  ...economia,
                  gastos: newGastosVal,
                  sobra: economia.salario - newGastosVal
                });
              }
              Alert.alert("Removido (Simulado)", "Gasto excluído com sucesso!");
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusIndicator = () => {
    switch (economia.status) {
      case 'RUIM':
        return { label: 'Crítico', color: COLORS.error, bg: '#FDECEB', icon: 'ellipse' };
      case 'ATENCAO':
        return { label: 'Atenção', color: '#E6A23C', bg: '#FFF9E6', icon: 'ellipse' };
      default:
        return { label: 'Excelente', color: COLORS.primary, bg: '#F0F9EB', icon: 'ellipse' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'alimentação':
      case 'alimentacao':
        return { name: 'restaurant-outline', color: '#E6A23C', bg: '#FFF9E6' };
      case 'transporte':
        return { name: 'car-outline', color: '#409EFF', bg: '#ECF5FF' };
      case 'serviços':
      case 'servicos':
        return { name: 'wallet-outline', color: '#909399', bg: '#F4F4F5' };
      default:
        return { name: 'cart-outline', color: COLORS.primary, bg: '#F0F9EB' };
    }
  };

  const statusInfo = getStatusIndicator();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title="Minhas Finanças" 
        onRefresh={loadData} 
        isLoading={loading} 
        showUserGreeting={true}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Economia Credit Card */}
        <View style={styles.creditCard}>
          <View style={styles.creditCardHeader}>
            <View>
              <Text style={styles.creditCardBrand}>Eletro-time Balance</Text>
              <Text style={styles.creditCardSubBrand}>CARTÃO DE ECONOMIAS</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <View style={[styles.statusDot, { backgroundColor: COLORS.white }]} />
              <Text style={[styles.statusText, { color: COLORS.white }]}>{statusInfo.label}</Text>
            </View>
          </View>
          
          <View style={styles.creditCardMiddle}>
            <Text style={styles.creditCardNumberLabel}>SOBRA LÍQUIDA</Text>
            <Text style={styles.creditCardBalance}>Kz {economia.sobra.toFixed(2)}</Text>
          </View>

          <View style={styles.creditCardFooter}>
            <View style={styles.creditCardInfoCol}>
              <Text style={styles.creditCardHolderLabel}>COLABORADOR</Text>
              <Text style={styles.creditCardHolderValue} numberOfLines={1}>
                {user?.nome ? `${user.nome} ${user.sobrenome}` : 'COLABORADOR'}
              </Text>
            </View>
            <View style={styles.creditCardDetailsRow}>
              <View style={styles.creditCardDetailItem}>
                <Text style={styles.creditCardDetailLabel}>SALÁRIO</Text>
                <Text style={styles.creditCardDetailValue}>Kz {economia.salario.toFixed(2)}</Text>
              </View>
              <View style={[styles.creditCardDetailItem, { marginLeft: 16 }]}>
                <Text style={styles.creditCardDetailLabel}>GASTOS</Text>
                <Text style={styles.creditCardDetailValue}>Kz {economia.gastos.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fugas de Dinheiro Projections */}
        <Text style={styles.sectionTitle}>Fugas de Dinheiro</Text>
        <View style={styles.timelineCard}>
          <Text style={styles.leakDesc}>{fugas.descricao}</Text>
          
          <View style={styles.timelineContainer}>
            {/* Timeline Line */}
            <View style={styles.timelineLine} />

            {/* Timeline Item 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDotContainer}>
                <View style={[styles.timelineDot, { backgroundColor: COLORS.primary }]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Projeção Diária</Text>
                <Text style={styles.timelineValue}>Kz {fugas.diaria.toFixed(2)}</Text>
              </View>
            </View>

            {/* Timeline Item 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDotContainer}>
                <View style={[styles.timelineDot, { backgroundColor: '#E6A23C' }]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Projeção Mensal</Text>
                <Text style={styles.timelineValue}>Kz {fugas.mensal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Timeline Item 3 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDotContainer}>
                <View style={[styles.timelineDot, { backgroundColor: COLORS.error }]} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Projeção Anual</Text>
                <Text style={[styles.timelineValue, { color: COLORS.error }]}>Kz {fugas.anual.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Gastos List */}
        <Text style={styles.sectionTitle}>Meus Gastos do Mês</Text>
        {gastos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textGrey} />
            <Text style={styles.emptyText}>Nenhum gasto registrado este mês.</Text>
          </View>
        ) : (
          gastos.map((item) => {
            const catIcon = getCategoryIcon(item.categoria);
            return (
              <View key={item.id} style={styles.gastoItem}>
                <View style={[styles.catIconContainer, { backgroundColor: catIcon.bg }]}>
                  <Ionicons name={catIcon.name as any} size={20} color={catIcon.color} />
                </View>
                <View style={styles.gastoInfo}>
                  <Text style={styles.gastoDesc}>{item.descricao}</Text>
                  <Text style={styles.gastoDate}>
                    {new Date(item.data).toLocaleDateString('pt-BR')} • {item.categoria}
                  </Text>
                </View>
                <View style={styles.gastoActions}>
                  <Text style={styles.gastoAmount}>Kz {item.valor.toFixed(2)}</Text>
                  <TouchableOpacity 
                    onPress={() => handleDeleteGasto(item.id)}
                    style={styles.deleteButton}
                    disabled={actionLoading}
                  >
                    <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
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
  creditCard: {
    backgroundColor: '#489E67',
    borderRadius: 24,
    padding: 22,
    height: 200,
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  creditCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  creditCardBrand: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  creditCardSubBrand: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  creditCardMiddle: {
    marginVertical: 12,
  },
  creditCardNumberLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  creditCardBalance: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  creditCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  creditCardInfoCol: {
    flex: 1,
    marginRight: 10,
  },
  creditCardHolderLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  creditCardHolderValue: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  creditCardDetailsRow: {
    flexDirection: 'row',
  },
  creditCardDetailItem: {
    alignItems: 'flex-end',
  },
  creditCardDetailLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  creditCardDetailValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  leakDesc: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 16,
    lineHeight: 20,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 10,
    marginTop: 10,
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 8,
    bottom: 24,
    width: 2,
    backgroundColor: '#F2F3F2',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'center',
  },
  timelineDotContainer: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginRight: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 13,
    color: COLORS.textGrey,
    fontWeight: '500',
  },
  timelineValue: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginTop: 12,
  },
  gastoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
    shadowColor: '#000',
    shadowOpacity: 0.01,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  catIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gastoInfo: {
    flex: 1,
  },
  gastoDesc: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  gastoDate: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginTop: 2,
  },
  gastoActions: {
    alignItems: 'flex-end',
  },
  gastoAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  deleteButton: {
    padding: 4,
    marginTop: 6,
  }
});
