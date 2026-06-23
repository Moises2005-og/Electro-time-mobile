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
    salario: 0.00,
    gastos: 0.00,
    sobra: 0.00,
    status: 'BOM' // BOM (🟢), ATENCAO (🟡), RUIM (🔴)
  });

  const [fugas, setFugas] = useState<any>({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    dias_considerados: 0,
    total: "0.00",
    media_diaria: "0.00",
    projecao_mensal: "0.00",
    projecao_anual: "0.00",
    maior_fuga: null,
    dica: "",
    por_categoria: []
  });

  const [gastos, setGastos] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resEconomia, resFugas, resGastos] = await Promise.all([
        api.get('/api/colaborador/minha_economia/'),
        api.get('/api/colaborador/fugas_de_dinheiro/'),
        api.get('/api/colaborador/meus_gastos/')
      ]);

      if (resEconomia) setEconomia(resEconomia);
      if (resFugas) setFugas(resFugas);
      if (resGastos && Array.isArray(resGastos)) setGastos(resGastos);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível carregar as informações financeiras.");
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
              await api.post('/api/colaborador/eliminar_gasto/', { gasto_id: id });
              setGastos(prev => prev.filter(item => item.id !== id));
              Alert.alert("Sucesso", "Gasto removido com sucesso!");
              loadData();
            } catch (e: any) {
              Alert.alert("Erro", e.message || "Não foi possível remover o gasto.");
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

  const maxMediaDiaria = fugas.por_categoria && fugas.por_categoria.length > 0
    ? Math.max(...fugas.por_categoria.map((c: any) => parseFloat(c.media_diaria) || 0))
    : 1;

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

        {/* Large "Abre-Olhos" Projection Card */}
        <View style={styles.eyeOpenerCard}>
          <View style={styles.eyeOpenerHeader}>
            <Ionicons name="eye-outline" size={22} color={COLORS.error} />
            <Text style={styles.eyeOpenerTitle}>Projeção de Perda Anual</Text>
          </View>
          <Text style={styles.eyeOpenerValue}>
            Kz {parseFloat(fugas.projecao_anual || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.eyeOpenerSubtitle}>
            Com base em {fugas.dias_considerados} dias decorridos neste mês. A média de fugas é de Kz {parseFloat(fugas.media_diaria || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia.
          </Text>
        </View>

        {/* Maior Fuga Alert Card */}
        {fugas.maior_fuga && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning-outline" size={20} color="#E6A23C" />
              <Text style={styles.alertTitle}>Alerta de Despesa</Text>
            </View>
            <Text style={styles.alertText}>{fugas.dica}</Text>
          </View>
        )}

        {/* Category breakdown */}
        {fugas.por_categoria && fugas.por_categoria.length > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Detalhamento por Categoria</Text>
            <View style={styles.divider} />
            {fugas.por_categoria.map((item: any, idx: number) => {
              const catIcon = getCategoryIcon(item.categoria);
              const barWidth = maxMediaDiaria > 0 ? (parseFloat(item.media_diaria) || 0) / maxMediaDiaria * 100 : 0;
              return (
                <View key={idx} style={styles.categoryLeakRow}>
                  <View style={styles.categoryLeakInfo}>
                    <View style={[styles.catIconContainerSmall, { backgroundColor: catIcon.bg }]}>
                      <Ionicons name={catIcon.name as any} size={16} color={catIcon.color} />
                    </View>
                    <View style={styles.categoryLeakText}>
                      <Text style={styles.categoryNameText}>{item.categoria}</Text>
                      <Text style={styles.categoryPercentageText}>{parseFloat(item.percentual_salario || '0').toFixed(1)}% do salário</Text>
                    </View>
                  </View>

                  {/* Comparative Bar */}
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarValue, { width: `${barWidth}%`, backgroundColor: catIcon.color }]} />
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statsGridItem}>
                      <Text style={styles.statsGridLabel}>Média Diária</Text>
                      <Text style={styles.statsGridValue}>Kz {parseFloat(item.media_diaria || '0').toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.statsGridItem}>
                      <Text style={styles.statsGridLabel}>Proj. Mensal</Text>
                      <Text style={styles.statsGridValue}>Kz {parseFloat(item.projecao_mensal || '0').toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.statsGridItem}>
                      <Text style={styles.statsGridLabel}>Proj. Anual</Text>
                      <Text style={styles.statsGridValue}>Kz {parseFloat(item.projecao_anual || '0').toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
                    </View>
                  </View>
                  
                  {idx < fugas.por_categoria.length - 1 && <View style={styles.itemDivider} />}
                </View>
              );
            })}
          </View>
        )}

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
    backgroundColor: COLORS.primary,
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
  eyeOpenerCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FFE3E3',
  },
  eyeOpenerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyeOpenerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.error,
    marginLeft: 8,
  },
  eyeOpenerValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 6,
  },
  eyeOpenerSubtitle: {
    fontSize: 12,
    color: COLORS.textGrey,
    lineHeight: 18,
  },
  alertCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#FFEFC2',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E6A23C',
    marginLeft: 8,
  },
  alertText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  categoryLeakRow: {
    paddingVertical: 14,
  },
  categoryLeakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catIconContainerSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryLeakText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoryPercentageText: {
    fontSize: 12,
    color: COLORS.textGrey,
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarValue: {
    height: '100%',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGridItem: {
    flex: 1,
  },
  statsGridLabel: {
    fontSize: 10,
    color: COLORS.textGrey,
    marginBottom: 2,
  },
  statsGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F3F2',
    marginVertical: 12,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F2F3F2',
    marginTop: 14,
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
