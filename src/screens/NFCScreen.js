import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
  Easing,
  Modal,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Signal, CheckCircle2, AlertTriangle, Smartphone, Radio, Clock, Accessibility, ChevronLeft, Volume2, X } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getPlaceById } from '../data/places';
import { getObraById } from '../data/obras';
import { useNfcReader } from '../hooks/useNfcReader';
import { Platform } from 'react-native';

export default function NFCScreen({ route, navigation }) {
  const placeId = route?.params?.placeId;
  const place = getPlaceById(placeId) || {};
  
  const { isScanning, scannedId, error, startScanning, cancelScanning, simulateScan, nfcSupported } = useNfcReader();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentObra, setCurrentObra] = useState(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [preferredVoice, setPreferredVoice] = useState(null);

  useEffect(() => {
    async function setupBestVoice() {
      const voices = await Speech.getAvailableVoicesAsync();
      
      // Filtra vozes em pt-BR
      const ptBrVoices = voices.filter(v => 
        v.language.startsWith('pt-BR') || v.language === 'pt-BR'
      );

      if (ptBrVoices.length > 0) {
        // Lógica de Prioridade:
        // 1. Vozes "Enhanced" no iOS (qualidade 2)
        // 2. Vozes neurais ou específicas (como 'Luciana' ou 'Felipe')
        // 3. Primeira disponível se nada for encontrado
        const best = ptBrVoices.find(v => v.quality === Speech.VoiceQuality.Enhanced) || 
                     ptBrVoices.find(v => v.name.toLowerCase().includes('google')) ||
                     ptBrVoices[0];
        
        setPreferredVoice(best);
      }
    }
    setupBestVoice();
  }, []);

  // Função de fala atualizada
  const falarComVozPremium = (texto) => {
    Speech.stop();
    Speech.speak(texto, {
      voice: preferredVoice?.identifier, // Aqui passamos o ID da voz selecionada
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.85, // Velocidade levemente reduzida para soar mais natural
    });
  };

  // Fade-in entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulsing animation for NFC icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Limpar a narração ao desmontar a tela
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Monitorar mudanças no scannedId para abrir o modal
  useEffect(() => {
    if (scannedId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const obra = getObraById(scannedId);
      setCurrentObra(obra);
      setModalVisible(true);

      if (obra) {
        falarComVozPremium(`Obra identificada: ${obra.titulo}.`);
      } else {
        falarComVozPremium('Obra não identificada neste roteiro.');
      }
    }
  }, [scannedId]);

  const handleAudioDescricao = () => {
    if (currentObra) {
      falarComVozPremium(currentObra.resumo);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const fecharModal = () => {
    Speech.stop();
    setModalVisible(false);
  };

  const getStatusConfig = () => {
    if (error) {
      return {
        icon: <AlertTriangle size={40} color="#DC2626" strokeWidth={2} />,
        title: 'Falha na leitura',
        subtitle: error,
        color: '#DC2626',
      };
    }
    if (isScanning) {
      return {
        icon: <Signal size={40} color={COLORS.primary} strokeWidth={2} />,
        title: 'Lendo totem...',
        subtitle: 'Mantenha o celular próximo ao totem NFC',
        color: COLORS.primary,
      };
    }
    if (scannedId) {
      return {
        icon: <CheckCircle2 size={40} color={COLORS.success} strokeWidth={2} />,
        title: 'Leitura concluída!',
        subtitle: 'Verifique os detalhes na tela.',
        color: COLORS.success,
      };
    }
    return {
      icon: <Smartphone size={40} color={COLORS.primary} strokeWidth={2} />,
      title: 'Aproxime do totem',
      subtitle: 'Encoste seu celular no totem NFC para iniciar a experiência inclusiva',
      color: COLORS.primary,
    };
  };

  const statusConfig = getStatusConfig();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* ───── HEADER ───── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={COLORS.white} strokeWidth={3} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {place.name || 'Local'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {place.fullName || 'Experiência inclusiva'}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* ───── CONTENT ───── */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Place info card */}
        {place.image && (
          <View style={styles.placeCard}>
            <Image
              source={place.image}
              style={styles.placeImage}
              resizeMode="cover"
            />
            <View style={styles.placeOverlay} />
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.fullName || place.name}</Text>
              <View style={styles.placeMeta}>
                <Clock size={14} color="rgba(255,255,255,0.85)" style={{ marginRight: 4 }} />
                <Text style={styles.placeMetaText}>{place.duration}</Text>
                {place.accessibilityType && (
                  <View style={styles.accessBadge}>
                    <Accessibility size={12} color={COLORS.white} style={{ marginRight: 4 }} />
                    <Text style={styles.accessBadgeText}>{place.accessibilityType}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* NFC Zone */}
        <View style={styles.nfcZone}>
          {/* Pulse rings */}
          <View style={styles.pulseContainer}>
            <Animated.View
              style={[
                styles.pulseRingOuter,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseRingMiddle,
                {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.15],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.nfcIconCircle}>
              {statusConfig.icon}
            </View>
          </View>

          {/* Status text */}
          <Text style={[styles.nfcTitle, { color: statusConfig.color }]}>
            {statusConfig.title}
          </Text>
          <Text style={styles.nfcSubtitle}>{statusConfig.subtitle}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsList}>
          <Text style={styles.instructionsTitle}>Como funciona?</Text>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <View style={styles.instructionTextGroup}>
              <Text style={styles.instructionLabel}>Encontre o totem</Text>
              <Text style={styles.instructionDesc}>
                Procure os totens com o símbolo NFC no local
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <View style={styles.instructionTextGroup}>
              <Text style={styles.instructionLabel}>Aproxime o celular</Text>
              <Text style={styles.instructionDesc}>
                Encoste a parte traseira do celular no totem
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <View style={styles.instructionTextGroup}>
              <Text style={styles.instructionLabel}>Aproveite o conteúdo</Text>
              <Text style={styles.instructionDesc}>
                Receba informações acessíveis sobre a obra ou espaço
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ───── BOTTOM ACTION ───── */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={isScanning ? cancelScanning : (nfcSupported ? startScanning : simulateScan)}
          onLongPress={simulateScan}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isScanning ? "Cancelar leitura NFC" : "Iniciar leitura NFC"}
          accessibilityHint="Dê um toque longo para simular a leitura se estiver testando no Expo Go."
        >
          {isScanning ? (
            <X size={20} color={COLORS.white} strokeWidth={2} />
          ) : (
            <Radio size={20} color={COLORS.white} strokeWidth={2} />
          )}
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Cancelar Leitura' : 'Iniciar leitura NFC'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.bottomHint}>
          Certifique-se de que o NFC está ativado. Toque longo para testar simulação.
        </Text>
      </View>

      {/* ───── MODAL DE DETALHES DA OBRA ───── */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} accessibilityRole="header">
                Detalhes da Obra
              </Text>
              <TouchableOpacity 
                onPress={fecharModal}
                style={styles.closeButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Fechar detalhes da obra e parar áudio"
              >
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {currentObra ? (
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.obraTitle}>{currentObra.titulo}</Text>
                <Text style={styles.obraAutor}>Por {currentObra.autor}</Text>
                
                <Text style={styles.obraResumo}>{currentObra.resumo}</Text>

                <TouchableOpacity 
                  style={styles.audioButton}
                  onPress={handleAudioDescricao}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Ouvir Audiodescrição. O leitor de tela narrará a descrição da obra."
                >
                  <Volume2 size={24} color={COLORS.white} style={{ marginRight: SPACING.sm }} />
                  <Text style={styles.audioButtonText}>Ouvir Audiodescrição</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.errorContainer}>
                <AlertTriangle size={48} color="#DC2626" />
                <Text style={styles.errorTextTitle}>Obra não identificada</Text>
                <Text style={styles.errorTextDesc}>
                  O ID lido ({scannedId}) não pertence ao roteiro atual ou a tag está corrompida.
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fecharModal}
                >
                  <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },

  // ── Header
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '700',
  },
  headerTitleGroup: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },

  // ── Content
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },

  // Place Card
  placeCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    height: 120,
    position: 'relative',
    marginBottom: SPACING.xl,
    ...SHADOW.strong,
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  placeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  placeInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  placeName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  placeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  placeMetaText: {
    fontSize: FONTS.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  accessBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessBadgeText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },

  // NFC Zone
  nfcZone: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  pulseContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pulseRingOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(26, 86, 219, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(26, 86, 219, 0.12)',
  },
  pulseRingMiddle: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(26, 86, 219, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(26, 86, 219, 0.18)',
  },
  nfcIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.strong,
  },
  nfcIcon: {
    fontSize: 36,
  },
  nfcTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    marginBottom: 6,
  },
  nfcSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
  },

  // Instructions
  instructionsList: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOW.card,
  },
  instructionsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
  },
  instructionTextGroup: {
    flex: 1,
  },
  instructionLabel: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  instructionDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Bottom Action
  bottomAction: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    ...SHADOW.strong,
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  scanButtonText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  bottomHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    minHeight: '60%',
    maxHeight: '90%',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalScroll: {
    flex: 1,
  },
  obraTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  obraAutor: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontWeight: '600',
  },
  obraResumo: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  audioButton: {
    backgroundColor: COLORS.primary, // #1A56DB (Azul do app)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOW.card,
  },
  audioButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  errorTextTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorTextDesc: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.textPrimary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
});
