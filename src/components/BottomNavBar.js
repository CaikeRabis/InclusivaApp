import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Home, Map as MapIcon, Heart, Settings } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';

const NAV_ITEMS = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'explore', icon: MapIcon, label: 'Explorar' },
  { key: 'saved', icon: Heart, label: 'Salvos' },
  { key: 'settings', icon: Settings, label: 'Config' },
];

export default function BottomNavBar({ activeTab, onTabChange }) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.navItem}
              onPress={() => onTabChange(item.key)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <View style={styles.activeIndicator}>
                  <item.icon size={24} color={COLORS.white} strokeWidth={2} />
                </View>
              ) : (
                <>
                  <item.icon size={22} color={COLORS.textMuted} strokeWidth={2} />
                  <Text style={styles.navLabel}>{item.label}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...SHADOW.strong,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    paddingVertical: 4,
  },
  activeIndicator: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  navIcon: {
    fontSize: 22,
  },
  navIconInactive: {
    opacity: 0.5,
  },
  navLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});
