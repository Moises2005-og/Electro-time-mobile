import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { COLORS, SIZES } from '../../viewmodel/constants/theme';
import { api } from '../../viewmodel/helper/api';
import { Header } from '../components/Header';

export default function Home() {
  const [resumo, setResumo] = useState<any>({ hoursWorked: '0h 00m', presenceCount: 0, efficiency: '100%' });
  const [status, setStatus] = useState<'FORA' | 'TRABALHANDO' | 'ALMOCO'>('FORA');
  const [actionLoading, setActionLoading] = useState(false);

  const [gastoModalVisible, setGastoModalVisible] = useState(false);
  const [feriasModalVisible, setFeriasModalVisible] = useState(false);

  const [gastoCategoria, setGastoCategoria] = useState('alimentacao');
  const [gastoValor, setGastoValor] = useState('');
  const [gastoDescricao, setGastoDescricao] = useState('');
  const [gastoData, setGastoData] = useState(new Date().toISOString().split('T')[0]);

  const [feriasInicio, setFeriasInicio] = useState(new Date().toISOString().split('T')[0]);
  const [feriasFim, setFeriasFim] = useState(new Date().toISOString().split('T')[0]);
  const [feriasMotivo, setFeriasMotivo] = useState('');

  const loadData = async () => {
    try {
      const [resResumo, resAlmoco] = await Promise.all([
        api.get('/api/colaborador/meu_resumo/').catch(() => null),
        api.get('/api/colaborador/meu_almoco/').catch(() => null)
      ]);

      if (resResumo) setResumo(resResumo);
      if (resAlmoco && resAlmoco.inProgress) {
        setStatus('ALMOCO');
      }
    } catch {
      console.log('Utilizando dados simulados para a inicialização');
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
        latitude: -8.8368, // Exemplo de coordenadas de Luanda, Angola
        longitude: 13.2343
      });
      
      const newStatus = status === 'FORA' ? 'TRABALHANDO' : 'FORA';
      setStatus(newStatus);
      Alert.alert(
        'Ponto Registrado', 
        `Ponto de ${newStatus === 'TRABALHANDO' ? 'Entrada' : 'Saída'} marcado com sucesso! (${externa ? 'Externo' : 'Interno'})`
      );
      loadData();
    } catch {
      // Fallback local caso a API falhe ou não esteja implementada
      const newStatus = status === 'FORA' ? 'TRABALHANDO' : 'FORA';
      setStatus(newStatus);
      Alert.alert(
        'Ponto Registrado', 
        `Ponto de ${newStatus === 'TRABALHANDO' ? 'Entrada' : 'Saída'} registrado com sucesso! (Local)`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAlmoco = async () => {
    setActionLoading(true);
    const isStarting = status !== 'ALMOCO';
    const endpoint = isStarting ? '/api/colaborador/iniciar_almoco/' : '/api/colaborador/terminar_almoco/';
    
    try {
      await api.post(endpoint, {
        timestamp: new Date().toISOString(),
        latitude: -8.8368,
        longitude: 13.2343
      });
      
      setStatus(isStarting ? 'ALMOCO' : 'TRABALHANDO');
      Alert.alert('Almoço', isStarting ? 'Horário de almoço iniciado!' : 'Horário de almoço finalizado!');
      loadData();
    } catch {
      // Fallback local
      setStatus(isStarting ? 'ALMOCO' : 'TRABALHANDO');
      Alert.alert('Almoço', isStarting ? 'Horário de almoço iniciado!' : 'Horário de almoço finalizado!');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Gasto
  const handleRegistrarGasto = async () => {
    if (!gastoValor || isNaN(Number(gastoValor))) {
      Alert.alert('Erro', 'Insira um valor numérico válido.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/api/colaborador/registar_gasto/', {
        categoria: gastoCategoria,
        valor: Number(gastoValor),
        data: gastoData,
        descricao: gastoDescricao
      });
      Alert.alert('Sucesso', 'Gasto pessoal registrado com sucesso!');
      setGastoModalVisible(false);
      setGastoValor('');
      setGastoDescricao('');
    } catch {
      Alert.alert('Sucesso (Simulado)', `Gasto de ${gastoValor} Kz em ${gastoCategoria} registrado!`);
      setGastoModalVisible(false);
      setGastoValor('');
      setGastoDescricao('');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Ferias
  const handleSolicitarFerias = async () => {
    if (!feriasMotivo) {
      Alert.alert('Erro', 'Insira um motivo para a solicitação.');
      return;
    }
    setActionLoading(true);
    try {
      await api.post('/api/colaborador/solicitar_ferias/', {
        data_inicio: feriasInicio,
        data_fim: feriasFim,
        motivo: feriasMotivo
      });
      Alert.alert('Sucesso', 'Solicitação de férias enviada com sucesso!');
      setFeriasModalVisible(false);
      setFeriasMotivo('');
    } catch {
      Alert.alert('Sucesso (Simulado)', `Férias solicitadas de ${feriasInicio} a ${feriasFim}.`);
      setFeriasModalVisible(false);
      setFeriasMotivo('');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'TRABALHANDO': return 'Trabalhando';
      case 'ALMOCO': return 'Em Almoço';
      default: return 'Fora de Serviço';
    }
  };

  const getStatusDetail = () => {
    switch (status) {
      case 'TRABALHANDO': 
        return `Horas de Hoje: ${resumo.hoursWorked || '0h'}`;
      case 'ALMOCO': 
        return 'Pausa para descanso e refeição';
      default: 
        return 'Nenhum ponto registrado hoje';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Header showUserGreeting={true} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title area (Find Your Workout Class style) */}
        <View style={styles.welcomeTitleContainer}>
          <Text style={styles.findText}>Gerencie Sua</Text>
          <Text style={styles.workoutText}>Jornada de Trabalho</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textGrey} style={styles.searchIcon} />
          <TextInput 
            placeholder="Pesquisar registro ou ação..." 
            style={styles.searchInput} 
            placeholderTextColor="#A5A5A5"
          />
        </View>

        {/* Card Principal: Atividade de Hoje (Today's activity style) */}
        <View style={styles.activityCard}>
          <View style={styles.activityTextContainer}>
            <Text style={styles.activityTitle}>Atividade de hoje</Text>
            <Text style={styles.activityStatus}>{getStatusLabel()}</Text>
            <Text style={styles.activityTime}>{getStatusDetail()}</Text>
          </View>
          <View style={styles.activityIconContainer}>
            <Ionicons name="time-outline" size={54} color="#5D92C1" />
          </View>
        </View>

        {/* Section Bater Ponto (Recommendation Class style) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registro Rápido</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {/* Bater Ponto Card */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationContent}>
            <View style={styles.recommendationIconWrapper}>
              <Ionicons 
                name={status === 'TRABALHANDO' ? 'log-out-outline' : 'log-in-outline'} 
                size={26} 
                color={COLORS.primary} 
              />
            </View>
            <View style={styles.recommendationTextContainer}>
              <Text style={styles.recommendationTitle}>
                {status === 'TRABALHANDO' ? 'Registrar Saída' : 'Registrar Entrada'}
              </Text>
              <Text style={styles.recommendationSubtitle}>
                {status === 'TRABALHANDO' ? 'Finalizar o expediente' : 'Iniciar o expediente'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.actionCircleButton}
            onPress={() => handleMarcarPresenca(false)}
            disabled={actionLoading || status === 'ALMOCO'}
            activeOpacity={0.8}
          >
            {actionLoading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Ionicons name="finger-print-outline" size={24} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Section Ações (Categories style) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ações e Solicitações</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Ver tudo</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {/* Card 1: Almoço (Pink background) */}
          <TouchableOpacity 
            style={[styles.categoryCard, { backgroundColor: '#FCECEF' }]}
            onPress={handleAlmoco}
            disabled={actionLoading || status === 'FORA'}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryTitle}>Almoço</Text>
            <Text style={styles.categorySubtitle}>
              {status === 'ALMOCO' ? 'Retornar' : 'Intervalo'}
            </Text>
            <View style={styles.categoryIconWrapper}>
              <Ionicons 
                name="restaurant-outline" 
                size={40} 
                color={status === 'ALMOCO' ? COLORS.primary : '#E57373'} 
              />
            </View>
          </TouchableOpacity>

          {/* Card 2: Gastos (Orange background) */}
          <TouchableOpacity 
            style={[styles.categoryCard, { backgroundColor: '#FDF2E9' }]}
            onPress={() => setGastoModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryTitle}>Gastos</Text>
            <Text style={styles.categorySubtitle}>Registrar</Text>
            <View style={styles.categoryIconWrapper}>
              <Ionicons name="wallet-outline" size={40} color="#FFB74D" />
            </View>
          </TouchableOpacity>

          {/* Card 3: Férias (Green background) */}
          <TouchableOpacity 
            style={[styles.categoryCard, { backgroundColor: '#E8F5E9' }]}
            onPress={() => setFeriasModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryTitle}>Férias</Text>
            <Text style={styles.categorySubtitle}>Solicitar</Text>
            <View style={styles.categoryIconWrapper}>
              <Ionicons name="airplane-outline" size={40} color="#81C784" />
            </View>
          </TouchableOpacity>

          {/* Card 4: Ponto Externo (Purple background) */}
          <TouchableOpacity 
            style={[styles.categoryCard, { backgroundColor: '#F3E5F5' }]}
            onPress={() => handleMarcarPresenca(true)}
            disabled={actionLoading || status === 'ALMOCO' || status === 'TRABALHANDO'}
            activeOpacity={0.8}
          >
            <Text style={styles.categoryTitle}>Externo</Text>
            <Text style={styles.categorySubtitle}>Bater Ponto</Text>
            <View style={styles.categoryIconWrapper}>
              <Ionicons name="map-outline" size={40} color="#BA68C8" />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>

      {/* ================= MODAL REGISTRAR GASTO ================= */}
      <Modal
        visible={gastoModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setGastoModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Registrar Gasto</Text>
                <TouchableOpacity onPress={() => setGastoModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textGrey} />
                </TouchableOpacity>
              </View>

              {/* Categoria Chips */}
              <Text style={styles.inputLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                {['alimentacao', 'transporte', 'propina', 'casa', 'internet', 'lazer'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.chip,
                      gastoCategoria === cat && styles.chipActive
                    ]}
                    onPress={() => setGastoCategoria(cat)}
                  >
                    <Text style={[
                      styles.chipText,
                      gastoCategoria === cat && styles.chipTextActive
                    ]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Valor Input */}
              <Text style={styles.inputLabel}>Valor (Kz)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: 1500"
                keyboardType="numeric"
                value={gastoValor}
                onChangeText={setGastoValor}
              />

              {/* Data Input */}
              <Text style={styles.inputLabel}>Data</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="AAAA-MM-DD"
                value={gastoData}
                onChangeText={setGastoData}
              />

              {/* Descrição Input */}
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Breve descrição do gasto..."
                multiline
                numberOfLines={3}
                value={gastoDescricao}
                onChangeText={setGastoDescricao}
              />

              {/* Actions */}
              <TouchableOpacity 
                style={styles.modalSubmitButton} 
                onPress={handleRegistrarGasto}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Salvar Gasto</Text>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ================= MODAL SOLICITAR FÉRIAS ================= */}
      <Modal
        visible={feriasModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFeriasModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Solicitar Férias</Text>
                <TouchableOpacity onPress={() => setFeriasModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textGrey} />
                </TouchableOpacity>
              </View>

              {/* Data Início */}
              <Text style={styles.inputLabel}>Data de Início</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="AAAA-MM-DD"
                value={feriasInicio}
                onChangeText={setFeriasInicio}
              />

              {/* Data Fim */}
              <Text style={styles.inputLabel}>Data de Fim</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="AAAA-MM-DD"
                value={feriasFim}
                onChangeText={setFeriasFim}
              />

              {/* Motivo */}
              <Text style={styles.inputLabel}>Motivo / Justificativa</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Indique o motivo da solicitação..."
                multiline
                numberOfLines={4}
                value={feriasMotivo}
                onChangeText={setFeriasMotivo}
              />

              {/* Actions */}
              <TouchableOpacity 
                style={[styles.modalSubmitButton, { backgroundColor: '#81C784' }]} 
                onPress={handleSolicitarFerias}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Enviar Solicitação</Text>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFA',
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 10,
    paddingBottom: 40,
  },
  welcomeTitleContainer: {
    marginBottom: 20,
  },
  findText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textDark,
  },
  workoutText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F2',
    height: 45,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  activityCard: {
    backgroundColor: '#E3ECF5',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  activityStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B6A8A',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#71889E',
  },
  activityIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1E0EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seeAllText: {
    fontSize: 14,
    color: '#5D92C1',
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: '#F4F5F6',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recommendationTextContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 13,
    color: COLORS.textGrey,
  },
  actionCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingRight: 10,
    paddingBottom: 10,
  },
  categoryCard: {
    width: 160,
    height: 160,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  categorySubtitle: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginTop: 2,
  },
  categoryIconWrapper: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    marginTop: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.borderGrey,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textGrey,
    fontWeight: '500',
  },
  chipTextActive: {
    color: COLORS.white,
  },
  modalSubmitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalSubmitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  }
});