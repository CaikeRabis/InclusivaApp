import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accessibility, Search, X, Settings } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import FilterTabs from '../components/FilterTabs';
import PlaceCard from '../components/PlaceCard';
import BottomNavBar from '../components/BottomNavBar';
import { PLACES } from '../data/places';
import { localService } from '../services/api';
import TrailTimeline from '../components/TrailTimeline';
import { EXPERIMENTAL_MODE } from './NFCScreen';

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeFilter, setActiveFilter] = useState('visual');
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPlaceImage = (img) => {
    if (EXPERIMENTAL_MODE && img === 'capitallab') {
      return require('../../assets/capital-lab-img.jpg');
    }
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

  React.useEffect(() => {
    async function loadPlaces() {
      try {
        const data = await localService.getAll();
        const mapped = data.map((p) => {
          let name = p.name;
          let fullName = p.fullName;
          let img = p.image;
          if (EXPERIMENTAL_MODE && (name === 'CCBB' || fullName === 'Centro Cultural Banco do Brasil')) {
            name = 'Capital Lab';
            fullName = 'Capital Lab';
            img = 'capitallab';
          }
          return {
            ...p,
            name,
            fullName,
            id: p._id || p.id,
            image: getPlaceImage(img),
          };
        });
        setPlaces(mapped);
      } catch (err) {
        let fallbackPlaces = PLACES.map(p => {
          let name = p.name;
          let fullName = p.fullName;
          let img = p.image;
          if (EXPERIMENTAL_MODE && (name === 'CCBB' || fullName === 'Centro Cultural Banco do Brasil')) {
            name = 'Capital Lab';
            fullName = 'Capital Lab';
            img = 'capitallab';
          }
          return {
            ...p,
            name,
            fullName,
            image: getPlaceImage(img)
          };
        });
        setPlaces(fallbackPlaces);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const filteredPlaces = activeFilter === 'todos'
    ? places
    : places.filter((p) => p.category === activeFilter);


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />

      {/* ───── HEADER ───── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* Logo + Greeting */}
          <View style={styles.headerLeft}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../../assets/logo_2_inclusiva.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.greeting}>{getGreeting()}!</Text>
              <Text style={styles.subGreeting}>Seja bem-vindo(a)!</Text>
            </View>
          </View>

          {/* Right actions */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.adminButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Admin')}
            >
              <Settings
                size={20}
                color="#ffffff"
                style={styles.adminButtonIcon}
              />
              {isDesktop && <Text style={styles.adminButtonLabel}>Admin</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
              <View style={styles.menuLine} />
              <View style={[styles.menuLine, styles.menuLineShort]} />
              <View style={styles.menuLine} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
          <Search size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar locais inclusivos..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        {EXPERIMENTAL_MODE && (
          <View style={styles.experimentalBadge}>
            <Text style={styles.experimentalBadgeText}>Modo Evento Capital Lab Ativo</Text>
          </View>
        )}
      </View>

      {/* ───── CONTENT ───── */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Tabs */}
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Section: Destaques */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destaques para você</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Vertical Cards */}
        <View style={styles.cardsContainer}>
          {(filteredPlaces.length > 0 ? filteredPlaces : PLACES).map((item) => (
            <PlaceCard
              key={item.id}
              place={item}
              onPress={() => navigation.navigate('NFC', { placeId: item.id })}
              onAudioPress={() => { }}
              onInfoPress={() => { }}
            />
          ))}
        </View>

        {/* Section: Minha Trilha Acessível */}
        <TrailTimeline />

        {/* Bottom spacing for nav bar */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ───── BOTTOM NAV ───── */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'explore') navigation.navigate('Explore');
          if (tab === 'settings') navigation.navigate('Settings');
        }}
      />
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
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + 4,
    borderBottomLeftRadius: RADIUS.xl + 8,
    borderBottomRightRadius: RADIUS.xl + 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logoEmoji: {
    fontSize: 24,
  },
  greeting: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  subGreeting: {
    fontSize: FONTS.sizes.md,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  adminButtonIcon: {
    fontSize: 16,
  },
  adminButtonLabel: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    padding: 10,
  },
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  menuLineShort: {
    width: 14,
    alignSelf: 'flex-start',
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: COLORS.orange,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  experimentalBadge: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    alignSelf: 'center',
    marginTop: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experimentalBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
  },

  // ── Content
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: SPACING.xl,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  seeAll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Cards
  cardsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  // Nearby
  nearbyList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOW.card,
  },
  nearbyIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyIconText: {
    fontSize: 22,
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  nearbyMeta: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  nearbyBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  nearbyBadgeText: {
    fontSize: 14,
  },
  nearbyArrow: {
    fontSize: 22,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
});
