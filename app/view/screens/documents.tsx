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
import { Header } from '../components/Header';

export default function Documents() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'RECIBOS' | 'DECLARACOES'>('RECIBOS');

  // States
  const [recibos, setRecibos] = useState<any[]>([]);

  const [declaracoes, setDeclaracoes] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRecibos, resDeclaracoes] = await Promise.all([
        api.get('/api/colaborador/meus_recibos/'),
        api.get('/api/colaborador/minhas_declaracoes/')
      ]);

      if (resRecibos && Array.isArray(resRecibos)) setRecibos(resRecibos);
      if (resDeclaracoes && Array.isArray(resDeclaracoes)) setDeclaracoes(resDeclaracoes);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível carregar os documentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = (docTitle: string) => {
    Alert.alert(
      "Download de Documento",
      `Deseja baixar o documento:\n"${docTitle}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Baixar", onPress: () => Alert.alert("Sucesso", "Download iniciado!") }
      ]
    );
  };

  const currentList = activeTab === 'RECIBOS' ? recibos : declaracoes;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header 
        title="Meus Documentos" 
        onRefresh={loadData} 
        isLoading={loading} 
        showUserGreeting={true}
      />

      {/* Segmented Control */}
      <View style={styles.segmentedControlContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[
              styles.segmentedButton, 
              activeTab === 'RECIBOS' && styles.segmentedButtonActive
            ]}
            onPress={() => setActiveTab('RECIBOS')}
          >
            <Text style={[
              styles.segmentedButtonText,
              activeTab === 'RECIBOS' && styles.segmentedButtonTextActive
            ]}>
              Recibos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.segmentedButton, 
              activeTab === 'DECLARACOES' && styles.segmentedButtonActive
            ]}
            onPress={() => setActiveTab('DECLARACOES')}
          >
            <Text style={[
              styles.segmentedButtonText,
              activeTab === 'DECLARACOES' && styles.segmentedButtonTextActive
            ]}>
              Declarações
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Document List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="folder-open-outline" size={48} color={COLORS.textGrey} />
            <Text style={styles.emptyText}>Nenhum documento encontrado nesta categoria.</Text>
          </View>
        ) : (
          currentList.map((doc) => (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.docIconContainer}>
                <Ionicons name="document-text" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle} numberOfLines={2}>{doc.titulo}</Text>
                <Text style={styles.docMeta}>
                  {new Date(doc.data).toLocaleDateString('pt-BR')} • {doc.tamanho}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => handleDownload(doc.titulo)}
              >
                <Ionicons name="cloud-download-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBFA'
  },
  segmentedControlContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 12,
    paddingTop: 10
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F2F3F2',
    borderRadius: 12,
    padding: 4
  },
  segmentedButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentedButtonActive: {
    backgroundColor: COLORS.white,
  },
  segmentedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGrey,
  },
  segmentedButtonTextActive: {
    color: COLORS.textDark,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 16,
    paddingBottom: 40,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  docIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF8F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    lineHeight: 18,
  },
  docMeta: {
    fontSize: 12,
    color: COLORS.textGrey,
    marginTop: 4,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginLeft: 8,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#F2F3F2',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textGrey,
    marginTop: 12,
    textAlign: 'center',
  }
});
