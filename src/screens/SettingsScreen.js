import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import BottomNavBar from '../components/BottomNavBar';

// Theme for High Contrast Settings Screen
const SETTINGS_THEME = {
  background: '#FFFFFF', // Clean white background
  textPrimary: '#000000', // Pure black for max contrast (21:1)
  textSecondary: '#333333', // Dark gray for secondary text (> 4.5:1)
  primary: '#0055CC', // Deep blue, WCAG AAA compliant on white
  surface: '#F5F5F5',
  border: '#CCCCCC',
  focusRing: '#FF8800', // Highly visible orange focus ring
};

export default function SettingsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('settings');

  // Form State
  const [fontSize, setFontSize] = useState(1); // multiplier
  const [contrast, setContrast] = useState(1); // multiplier
  const [audioDesc, setAudioDesc] = useState(false);
  const [alertRadius, setAlertRadius] = useState(2000); // meters
  
  // Focus State for Accessibility (Keyboard/Switch navigation)
  const [focusedElement, setFocusedElement] = useState(null);

  const handleFocus = (elementId) => setFocusedElement(elementId);
  const handleBlur = () => setFocusedElement(null);

  const getFocusStyle = (elementId) => {
    return focusedElement === elementId ? styles.focusedElement : null;
  };

  // Haptic feedback test functions
  const playHaptic = (style) => {
    switch (style) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  };

  const handleAudioDescToggle = (value) => {
    setAudioDesc(value);
    if (value) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SETTINGS_THEME.background} />
      
      {/* ───── HEADER ───── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">Central de Experiência</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* ───── PERFIL DO USUÁRIO ───── */}
        <View 
          style={styles.profileSection}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel="Perfil do usuário logado: João Silva. Conta conectada."
        >
          <View style={styles.avatarContainer} importantForAccessibility="no-hide-descendants">
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <View style={styles.profileInfo} importantForAccessibility="no-hide-descendants">
            <Text style={styles.profileName}>João Silva</Text>
            <Text style={styles.profileSubtitle}>Conta Conectada</Text>
          </View>
        </View>

        {/* ───── PERFIL SENSORIAL ───── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Meu Perfil Sensorial</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel} nativeID="font-size-label">Tamanho de Fonte</Text>
            <View style={[styles.sliderContainer, getFocusStyle('slider-font')]}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={2}
                step={0.1}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor={SETTINGS_THEME.primary}
                maximumTrackTintColor={SETTINGS_THEME.border}
                thumbTintColor={SETTINGS_THEME.primary}
                onFocus={() => handleFocus('slider-font')}
                onBlur={handleBlur}
                accessibilityLabel="Ajustar o tamanho da fonte"
                accessibilityValue={{ min: 100, max: 200, now: Math.round(fontSize * 100) }}
                accessibilityHint="Deslize para aumentar ou diminuir o texto do aplicativo."
                accessibilityLabelledBy="font-size-label"
              />
            </View>
            <Text style={styles.settingValue}>{Math.round(fontSize * 100)}%</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel} nativeID="contrast-label">Contraste de Cores</Text>
            <View style={[styles.sliderContainer, getFocusStyle('slider-contrast')]}>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={3}
                step={0.5}
                value={contrast}
                onValueChange={setContrast}
                minimumTrackTintColor={SETTINGS_THEME.primary}
                maximumTrackTintColor={SETTINGS_THEME.border}
                thumbTintColor={SETTINGS_THEME.primary}
                onFocus={() => handleFocus('slider-contrast')}
                onBlur={handleBlur}
                accessibilityLabel="Ajustar nível de contraste"
                accessibilityValue={{ min: 1, max: 3, now: contrast }}
                accessibilityHint="Deslize para aumentar o contraste de cores da interface."
                accessibilityLabelledBy="contrast-label"
              />
            </View>
            <Text style={styles.settingValue}>Nível {contrast}</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextGroup}>
              <Text style={styles.settingLabel}>Modo Audiodescrição de Interface</Text>
              <Text style={styles.settingHint}>O aplicativo narra as transições e eventos na tela.</Text>
            </View>
            <Switch
              value={audioDesc}
              onValueChange={handleAudioDescToggle}
              trackColor={{ false: SETTINGS_THEME.border, true: SETTINGS_THEME.primary }}
              thumbColor={SETTINGS_THEME.background}
              style={getFocusStyle('switch-audio')}
              onFocus={() => handleFocus('switch-audio')}
              onBlur={handleBlur}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Ativar modo de audiodescrição de interface"
              accessibilityState={{ checked: audioDesc }}
            />
          </View>
        </View>

        {/* ───── FEEDBACK TÁTIL ───── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Feedback Tátil e Sonoro</Text>
          <Text style={styles.settingHint}>Escolha a intensidade da vibração para notificações de eventos próximos.</Text>
          
          <View style={styles.hapticButtonsGroup}>
            <TouchableOpacity
              style={[styles.hapticButton, getFocusStyle('haptic-light')]}
              onPress={() => playHaptic('light')}
              onFocus={() => handleFocus('haptic-light')}
              onBlur={handleBlur}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Testar vibração curta e suave"
              accessibilityHint="Toca uma vibração leve no aparelho."
            >
              <Text style={styles.hapticButtonText}>Suave</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hapticButton, getFocusStyle('haptic-medium')]}
              onPress={() => playHaptic('medium')}
              onFocus={() => handleFocus('haptic-medium')}
              onBlur={handleBlur}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Testar vibração média"
            >
              <Text style={styles.hapticButtonText}>Média</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.hapticButton, getFocusStyle('haptic-heavy')]}
              onPress={() => playHaptic('heavy')}
              onFocus={() => handleFocus('haptic-heavy')}
              onBlur={handleBlur}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Testar vibração forte"
            >
              <Text style={styles.hapticButtonText}>Forte</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
              style={[styles.hapticButton, styles.hapticButtonWide, getFocusStyle('haptic-success')]}
              onPress={() => playHaptic('success')}
              onFocus={() => handleFocus('haptic-success')}
              onBlur={handleBlur}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Testar vibração de sucesso"
            >
              <Text style={styles.hapticButtonText}>Padrão de Sucesso (Duplo Pulso)</Text>
          </TouchableOpacity>
        </View>

        {/* ───── GUIA BRASÍLIA ───── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Guia Brasília</Text>
          <Text style={styles.settingHint}>Ajuste a distância para detecção de centros culturais próximos no mapa e notificações.</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel} nativeID="radius-label">Raio de Alerta</Text>
            <View style={[styles.sliderContainer, getFocusStyle('slider-radius')]}>
              <Slider
                style={styles.slider}
                minimumValue={500}
                maximumValue={10000}
                step={500}
                value={alertRadius}
                onValueChange={setAlertRadius}
                minimumTrackTintColor={SETTINGS_THEME.primary}
                maximumTrackTintColor={SETTINGS_THEME.border}
                thumbTintColor={SETTINGS_THEME.primary}
                onFocus={() => handleFocus('slider-radius')}
                onBlur={handleBlur}
                accessibilityLabel="Ajustar raio de alerta geográfico"
                accessibilityValue={{ min: 500, max: 10000, now: alertRadius }}
                accessibilityHint="Deslize para aumentar a distância em que eventos são notificados."
                accessibilityLabelledBy="radius-label"
              />
            </View>
            <Text style={styles.settingValue}>
              {alertRadius >= 1000 ? `${(alertRadius / 1000).toFixed(1)} km` : `${alertRadius} m`}
            </Text>
          </View>
        </View>
        
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* ───── BOTTOM NAV ───── */}
      <BottomNavBar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') navigation.navigate('Home');
          if (tab === 'explore') navigation.navigate('Explore');
        }} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SETTINGS_THEME.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: SETTINGS_THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: SETTINGS_THEME.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900', // Very bold for visibility
    color: SETTINGS_THEME.textPrimary,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: SETTINGS_THEME.border,
    backgroundColor: SETTINGS_THEME.surface,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: SETTINGS_THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: SETTINGS_THEME.background,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: SETTINGS_THEME.textPrimary,
  },
  profileSubtitle: {
    fontSize: FONTS.sizes.md,
    color: SETTINGS_THEME.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: SETTINGS_THEME.border,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: SETTINGS_THEME.primary,
    marginBottom: SPACING.md,
  },
  settingHint: {
    fontSize: FONTS.sizes.md,
    color: SETTINGS_THEME.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  settingRow: {
    marginBottom: SPACING.xl,
  },
  settingLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: SETTINGS_THEME.textPrimary,
    marginBottom: SPACING.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // Minimum touch target 48dp wrapper for slider
    minHeight: 48, 
    justifyContent: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  settingValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: SETTINGS_THEME.textPrimary,
    alignSelf: 'flex-end',
    marginTop: -10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64, // Extra large touch target
    marginTop: SPACING.sm,
  },
  switchTextGroup: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  hapticButtonsGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  hapticButton: {
    flex: 1,
    backgroundColor: SETTINGS_THEME.surface,
    borderColor: SETTINGS_THEME.primary,
    borderWidth: 2,
    borderRadius: RADIUS.md,
    minHeight: 48, // 48x48dp minimum touch target requirement
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  hapticButtonWide: {
    width: '100%',
  },
  hapticButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: SETTINGS_THEME.textPrimary,
  },
  focusedElement: {
    // Clear visual focus state for keyboard/switch navigation
    outlineWidth: 3, // For web if tested there
    outlineStyle: 'solid',
    outlineColor: SETTINGS_THEME.focusRing,
    borderColor: SETTINGS_THEME.focusRing,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 136, 0, 0.1)',
  }
});
