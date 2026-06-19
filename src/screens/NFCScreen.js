import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Easing,
  Modal,
  ScrollView,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Signal, CheckCircle2, AlertTriangle, Smartphone, Radio, Clock, Accessibility, ChevronLeft, Volume2, X, Hand, QrCode, Camera } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getPlaceById } from '../data/places';
import { getObraById } from '../data/obras';
import { localService, obraService } from '../services/api';
import { useNfcReader } from '../hooks/useNfcReader';
import { Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function NFCScreen({ route, navigation }) {
  const placeId = route?.params?.placeId;
  const [place, setPlace] = useState({});

  const getPlaceImage = (img) => {
    if (!img) return require('../../assets/ccbb.jpg');
    if (typeof img === 'number') return img;
    if (typeof img === 'string') {
      if (img.startsWith('http')) return { uri: img };
      if (img === '../../assets/ccbb.jpg') return require('../../assets/ccbb.jpg');
      if (img === '../../assets/museu.jpg') return require('../../assets/museu.jpg');
      if (img === '../../assets/teatro.jpg') return require('../../assets/teatro.jpg');
    }
    return require('../../assets/ccbb.jpg');
  };

  useEffect(() => {
    async function loadPlace() {
      try {
        const data = await localService.getById(placeId);
        setPlace({
          ...data,
          id: data._id || data.id,
          image: getPlaceImage(data.image),
        });
      } catch (err) {
        setPlace(getPlaceById(placeId) || {});
      }
    }
    if (placeId) {
      loadPlace();
    }
  }, [placeId]);

  
  const nfcIdParam = route?.params?.nfcId;
  const { isScanning, scannedId: nfcScannedId, error, startScanning, cancelScanning, nfcSupported: hwNfcSupported } = useNfcReader();
  const [forceQrCode, setForceQrCode] = useState(false);
  const nfcSupported = hwNfcSupported && !forceQrCode;

  useFocusEffect(
    React.useCallback(() => {
      async function loadSettings() {
        try {
          const qrPref = await AsyncStorage.getItem('@force_qr_code');
          if (qrPref !== null) {
            setForceQrCode(JSON.parse(qrPref));
          }
        } catch (e) {}
      }
      loadSettings();
    }, [])
  );

  const [devScannedId, setDevScannedId] = useState(null);
  const [qrScannedId, setQrScannedId] = useState(null);
  const scannedId = nfcScannedId || nfcIdParam || devScannedId || qrScannedId;
  const [modalVisible, setModalVisible] = useState(false);
  const [currentObra, setCurrentObra] = useState(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  
  const titleRef = useRef(null);

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

  // Função de fala atualizada com proteção para Cold Start
  const falarComVozPremium = (texto, rate = speechRate) => {
    Speech.stop();
    setIsSpeaking(true);
    
    // Pequeno delay para garantir que o Android inicialize a engine de TTS
    // caso o app tenha acabado de ser acordado por um Deep Link NFC
    setTimeout(() => {
      const options = {
        language: 'pt-BR',
        pitch: 1.0,
        rate: rate,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      };

      if (preferredVoice && preferredVoice.identifier) {
        options.voice = preferredVoice.identifier;
      }

      Speech.speak(texto, options);
    }, 300);
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

  // Foca no título da obra ao abrir o modal
  useEffect(() => {
    if (modalVisible && currentObra && titleRef.current) {
      setTimeout(() => {
        const reactTag = findNodeHandle(titleRef.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }, 500); // Delay para garantir montagem
    }
  }, [modalVisible, currentObra]);

  // Monitorar mudanças no scannedId para abrir o modal
  useEffect(() => {
    async function fetchScannedObra() {
      if (scannedId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
          const obra = await obraService.getByNfcId(scannedId);
          setCurrentObra(obra);
          setModalVisible(true);
          if (obra) {
            falarComVozPremium(`Obra identificada: ${obra.titulo}. ${obra.resumo}`);
          } else {
            falarComVozPremium('Obra não identificada neste roteiro.');
          }
        } catch (err) {
          console.warn('Erro ao carregar obra do NFC:', err.message);
          // Fallback para mock local
          const obra = getObraById(scannedId);
          setCurrentObra(obra);
          setModalVisible(true);
          if (obra) {
            falarComVozPremium(`Obra identificada: ${obra.titulo}. ${obra.resumo}`);
          } else {
            falarComVozPremium('Obra não identificada neste roteiro.');
          }
        }
      }
    }
    fetchScannedObra();
  }, [scannedId]);


  const handleAudioDescricao = () => {
    if (currentObra) {
      falarComVozPremium(currentObra.resumo, speechRate);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const cycleSpeechRate = () => {
    let nextRate = 1.0;
    if (speechRate === 1.0) nextRate = 1.5;
    else if (speechRate === 1.5) nextRate = 2.0;
    
    setSpeechRate(nextRate);
    
    if (isSpeaking && currentObra) {
      falarComVozPremium(currentObra.resumo, nextRate);
    }
  };

  const fecharModal = () => {
    Speech.stop();
    setIsSpeaking(false);
    setModalVisible(false);
    setDevScannedId(null);
    setQrScannedId(null);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setIsCameraVisible(false);
    // Extrai o ID da URL se for inclusiva://obra/ID ou similar, senao assume que eh apenas o ID
    let id = data;
    const match = data.match(/inclusiva:\/\/obra\/(\w+)/i);
    if (match) {
      id = match[1];
    }
    setQrScannedId(id);
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
    if (nfcSupported === false) {
      return {
        icon: <QrCode size={40} color={COLORS.primary} strokeWidth={2} />,
        title: 'Escanear QR Code',
        subtitle: 'Este aparelho não possui NFC. Use a câmera para ler o QR Code da obra.',
        color: COLORS.primary,
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
      <Animated.ScrollView
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
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
              <Text style={styles.instructionLabel}>{nfcSupported === false ? 'Abra a câmera' : 'Aproxime o celular'}</Text>
              <Text style={styles.instructionDesc}>
                {nfcSupported === false ? 'Aponte a câmera para o QR Code da placa' : 'Encoste a parte traseira do celular no totem'}
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
      </Animated.ScrollView>

      {/* ───── BOTTOM ACTION ───── */}
      <View style={styles.bottomAction}>
        {nfcSupported === false ? (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={async () => {
              if (!permission?.granted) {
                await requestPermission();
              }
              setIsCameraVisible(true);
            }}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Abrir câmera para escanear QR Code"
          >
            <Camera size={20} color={COLORS.white} strokeWidth={2} />
            <Text style={styles.scanButtonText}>Abrir Câmera</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={isScanning ? cancelScanning : startScanning}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isScanning ? "Cancelar leitura NFC" : "Iniciar leitura NFC"}
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
        )}

        <Text style={styles.bottomHint}>
          {nfcSupported === false 
            ? 'Aponte a câmera para o QR Code presente na placa.' 
            : 'Certifique-se de que o NFC está ativado e as permissões foram concedidas.'}
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
              <Text ref={titleRef} style={styles.modalTitle} accessibilityRole="header">
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
              <View style={styles.modalBody}>
                {/* ───── TÍTULO E RESUMO ───── */}
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.obraTitle} numberOfLines={2}>{currentObra.titulo}</Text>
                  <ScrollView style={{ flexGrow: 0, maxHeight: 400, marginBottom: SPACING.md }}>
                    <Text style={styles.obraResumo}>{currentObra.resumo}</Text>
                  </ScrollView>
                </View>

                {/* ───── CONTROLES INFERIORES ───── */}
                <View style={styles.bottomControls}>
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity 
                      style={styles.audioButton}
                      onPress={handleAudioDescricao}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Ouvir Audiodescrição. O leitor de tela narrará a descrição da obra."
                    >
                      <Volume2 size={20} color={COLORS.white} style={{ marginRight: SPACING.sm }} />
                      <Text style={styles.audioButtonText}>Ouvir Áudio</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rateControlContainer}>
                    <Text style={styles.rateControlLabel}>Velocidade do Áudio:</Text>
                    <TouchableOpacity 
                      style={styles.rateButton}
                      onPress={cycleSpeechRate}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Velocidade atual: ${speechRate} vezes. Toque para alterar.`}
                    >
                      <Text style={styles.rateButtonText}>{speechRate}x</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: '#10B981', fontSize: 12, textAlign: 'center', marginTop: 8, fontWeight: 'bold' }}>
                    ✓ Modo Acessibilidade V4 (Foco + Velocidade)
                  </Text>
                </View>
              </View>
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

      {/* ───── MODAL DE CÂMERA (QR CODE) ───── */}
      <Modal
        visible={isCameraVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsCameraVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity 
              onPress={() => setIsCameraVisible(false)}
              style={styles.cameraCloseButton}
            >
              <X size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Escanear QR Code</Text>
            <View style={{ width: 40 }} />
          </View>
          
          {isCameraVisible && (
            <View style={styles.cameraContainer}>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
              <View style={styles.qrOverlay}>
                <View style={styles.qrMarker} />
              </View>
            </View>
          )}
        </SafeAreaView>
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
  modalBody: {
    flex: 1,
    justifyContent: 'space-between',
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
  // ── Action Buttons Row
  bottomControls: {
    marginTop: SPACING.md,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  audioButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    ...SHADOW.card,
  },
  audioButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
  },
  librasButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  librasButtonActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  librasButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
  },
  librasButtonTextActive: {
    color: COLORS.white,
  },

  // ── Speech Rate Control
  rateControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.md,
  },
  rateControlLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  rateButton: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  rateButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.white,
  },

  // ── VLibras Card
  vlibrasCard: {
    marginTop: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: '#F8FAFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F4',
    overflow: 'hidden',
  },
  vlibrasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F4',
  },
  vlibrasHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vlibrasHeaderTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.primary,
  },
  vlibrasLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  vlibrasLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  vlibrasLiveText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  vlibrasContainer: {
    width: '100%',
    height: 220,
    backgroundColor: 'transparent',
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
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#000',
  },
  cameraTitle: {
    color: '#FFF',
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  cameraCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  qrOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrMarker: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    borderRadius: RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
});
