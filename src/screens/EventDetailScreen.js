import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ChevronLeft, MapPin, Calendar, Accessibility, Clock, Map as MapIcon, Compass } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getEventById } from '../data/events';

export default function EventDetailScreen({ route, navigation }) {
  const eventId = route?.params?.eventId;
  const event = getEventById(eventId) || {};

  if (!event.id) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Evento não encontrado.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const navigateToEvent = () => {
    // In a real app, this could open Google Maps or trigger text-to-speech directions
    console.log(`Iniciando rota para ${event.local}, ${event.localizacao_geografica.descricao_espacial}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.textPrimary} />

      {/* ───── HEADER ───── */}
      <View style={styles.header} accessible={true} accessibilityRole="header">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Voltar para a tela anterior"
        >
          <ChevronLeft size={24} color={COLORS.white} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalhes do Evento</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ───── HERO SECTION ───── */}
        <View style={styles.heroSection}>
          <Text style={styles.eventTitle} accessibilityRole="header">{event.titulo}</Text>
          <View style={styles.metaRowDetail}>
            <MapPin size={18} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
            <Text style={styles.eventLocal}>{event.local}</Text>
          </View>
          <View style={styles.metaRowDetail}>
            <Calendar size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.eventDate}>{new Date(event.data_hora).toLocaleDateString('pt-BR')} às {new Date(event.data_hora).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</Text>
          </View>
        </View>

        {/* ───── ACESSIBILIDADE EM DESTAQUE ───── */}
        <View 
          style={styles.accessibilitySection}
          accessible={true}
          accessibilityLabel={`Recursos de acessibilidade disponíveis: ${event.tipo_de_acessibilidade.join(', ')}`}
        >
          <View style={styles.sectionTitleRow}>
            <Accessibility size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Acessibilidade Disponível</Text>
          </View>
          <View style={styles.tagsContainer}>
            {event.tipo_de_acessibilidade.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ───── HORÁRIOS ACESSÍVEIS ───── */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionTitleRow}>
            <Clock size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Horários Acessíveis</Text>
          </View>
          {event.horarios_acessiveis.map((horario, index) => (
            <View 
              key={index} 
              style={styles.scheduleRow}
              accessible={true}
              accessibilityLabel={`Às ${horario.horario}: ${horario.tipo}`}
            >
              <Text style={styles.scheduleTime}>{horario.horario}</Text>
              <Text style={styles.scheduleType}>{horario.tipo}</Text>
            </View>
          ))}
        </View>

        {/* ───── NAVEGAÇÃO ───── */}
        <View style={styles.navigationSection}>
          <View style={styles.sectionTitleRow}>
            <MapIcon size={20} color={COLORS.textPrimary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Como Chegar</Text>
          </View>
          <Text style={styles.navDescription}>
            O evento acontece {event.localizacao_geografica.descricao_espacial}.
          </Text>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={navigateToEvent}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Iniciar navegação por voz para ${event.local}`}
            accessibilityHint="Abre o mapa e inicia a rota por voz até o local"
          >
            <Compass size={24} color={COLORS.white} style={{ marginRight: SPACING.sm }} />
            <Text style={styles.navButtonText}>Iniciar Rota Guiada por Voz</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // High contrast background
    backgroundColor: '#F0F0F0',
  },
  header: {
    backgroundColor: COLORS.textPrimary, // Very dark header for high contrast
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  eventTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '900',
    color: COLORS.textPrimary, // High contrast text
    marginBottom: SPACING.sm,
    lineHeight: 34,
  },
  eventLocal: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metaRowDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  accessibilitySection: {
    backgroundColor: '#E6F0FA', // Light blue background for visual grouping
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: COLORS.primaryDark, // High contrast badges
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  tagText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: '700',
  },
  scheduleSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  scheduleTime: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.primaryDark,
    width: 80,
  },
  scheduleType: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: '600',
  },
  navigationSection: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  navDescription: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  navButton: {
    backgroundColor: COLORS.textPrimary, // High contrast action button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    ...SHADOW.strong,
  },
  navButtonIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  navButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 50,
  },
  backBtn: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: '#ccc',
  },
  backBtnText: {
    fontSize: 16,
  }
});
