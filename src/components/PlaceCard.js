import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Star, Clock, Volume2, Info } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';

const CARD_HEIGHT = 220;

export default function PlaceCard({ place, onPress, onAudioPress, onInfoPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Place Image */}
      <View style={styles.imageContainer}>
        <Image
          source={place.image}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Gradient overlay */}
        <View style={styles.imageOverlay} />

        {/* Price Badge */}
        <View style={[styles.priceBadge, place.isFree ? styles.freeBadge : styles.paidBadge]}>
          <View style={styles.badgeContent}>
            {place.isFree && <Star size={12} color={COLORS.white} fill={COLORS.white} style={{ marginRight: 4 }} />}
            <Text style={styles.priceBadgeText}>
              {place.isFree ? 'Gratuito' : `R$ ${place.price}`}
            </Text>
          </View>
        </View>

        {/* Rating */}
        {place.rating && (
          <View style={styles.ratingBadge}>
            <Star size={12} color="#FFD700" fill="#FFD700" style={{ marginRight: 4 }} />
            <Text style={styles.ratingText}>{place.rating}</Text>
          </View>
        )}
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.textGroup}>
            <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
            <View style={styles.metaRow}>
              <View style={styles.durationRow}>
                <Clock size={14} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.duration}>{place.duration}</Text>
              </View>
              {place.accessibility && (
                <View style={styles.accessibilityBadge}>
                  <Text style={styles.accessibilityText}>{place.accessibilityType}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={onAudioPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Volume2 size={18} color={COLORS.primary} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnPrimary]}
              onPress={onInfoPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Info size={18} color={COLORS.white} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOW.strong,
  },
  imageContainer: {
    width: '100%',
    height: CARD_HEIGHT * 0.62,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  priceBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  freeBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.92)',
  },
  paidBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
  },
  priceBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  placeName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  accessibilityBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  accessibilityText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
  iconBtnText: {
    fontSize: 16,
  },
});
