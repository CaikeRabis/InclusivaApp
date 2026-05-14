import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Footprints } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { TRAIL_TODAY } from '../data/trail';

export default function TrailTimeline() {
  const navigation = useNavigation();

  const getSensoryColor = (type) => {
    switch (type) {
      case 'visual': return COLORS.orange;
      case 'auditivo': return COLORS.primary;
      default: return COLORS.success;
    }
  };

  const getSensoryLabel = (type) => {
    switch (type) {
      case 'visual': return 'visual';
      case 'auditivo': return 'auditiva';
      default: return 'interativa';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle} accessibilityRole="header">Sua Trilha de Hoje</Text>
      
      <View style={styles.timelineContainer}>
        {TRAIL_TODAY.map((item, index) => {
          const isLast = index === TRAIL_TODAY.length - 1;
          const sensoryColor = getSensoryColor(item.sensoryFocus);
          
          // Dynamic accessibility label composing all info
          const nextStepInfo = item.transitToNext ? `. Próxima etapa a ${item.transitToNext}` : '. Esta é a última etapa da trilha';
          const a11yLabel = `Etapa ${item.order}: Das ${item.time.replace('-', 'às')}. ${item.action} no ${item.location}. Foco em acessibilidade ${getSensoryLabel(item.sensoryFocus)}${nextStepInfo}. Toque duas vezes para detalhes da acessibilidade da obra.`;

          return (
            <View key={item.id} style={styles.stepContainer}>
              {/* Left Timeline Axis */}
              <View style={styles.axis}>
                <View style={[styles.node, { borderColor: sensoryColor }]}>
                  <Text style={[styles.nodeText, { color: sensoryColor }]}>{item.order}</Text>
                </View>
                {!isLast && <View style={styles.line} />}
              </View>

              {/* Right Content */}
              <View style={styles.contentArea}>
                <TouchableOpacity 
                  style={styles.card}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('EventDetail', { eventId: item.eventId })}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={a11yLabel}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.timeText} importantForAccessibility="no">{item.time}</Text>
                    <View style={[styles.badge, { backgroundColor: sensoryColor }]} importantForAccessibility="no">
                      <Text style={styles.badgeText}>{getSensoryLabel(item.sensoryFocus)}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.actionText} importantForAccessibility="no">{item.action}</Text>
                  <View style={styles.locationRow}>
                    <MapPin size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.locationText} importantForAccessibility="no">{item.location}</Text>
                  </View>
                </TouchableOpacity>

                {/* Transit Info */}
                {item.transitToNext && (
                  <View style={styles.transitContainer} importantForAccessibility="no">
                    <Footprints size={16} color={COLORS.textMuted} style={{ marginRight: SPACING.sm }} />
                    <Text style={styles.transitText}>{item.transitToNext}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  timelineContainer: {
    paddingLeft: SPACING.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  axis: {
    alignItems: 'center',
    width: 32,
    marginRight: SPACING.md,
  },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.tabBorder,
    marginVertical: -4, // Connects nodes seamlessly
    zIndex: 1,
  },
  contentArea: {
    flex: 1,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.card,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent', // Can be used for extra color coding if wanted
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  actionText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 24,
  },
  locationText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginLeft: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  transitIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    opacity: 0.7,
  },
  transitText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    fontWeight: '600',
    fontStyle: 'italic',
  }
});
