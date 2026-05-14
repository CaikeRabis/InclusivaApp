import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Eye, Volume2, Handshake } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';

const FILTER_TYPES = [
  { key: 'visual', label: 'Visual', icon: Eye },
  { key: 'auditivo', label: 'Auditivo', icon: Volume2 },
  { key: 'interativo', label: 'Interativo', icon: Handshake },
];

export default function FilterTabs({ activeFilter, onFilterChange }) {
  return (
    <View style={styles.container}>
      {FILTER_TYPES.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <TouchableOpacity
            key={filter.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.75}
          >
            <filter.icon 
              size={18} 
              color={isActive ? COLORS.white : COLORS.textSecondary} 
              strokeWidth={2} 
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    padding: 4,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.card,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  tabActive: {
    backgroundColor: COLORS.orange,
    ...SHADOW.card,
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.white,
  },
});
