import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map as MapIcon, List, MapPin, Accessibility } from 'lucide-react-native';
import MapView, { Marker, Callout } from '../components/Map';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import BottomNavBar from '../components/BottomNavBar';
import { EVENTS } from '../data/events';
import { explorarEventos } from '../utils/filterLogic';

export default function ExploreScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [activeTab, setActiveTab] = useState('explore');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  const filteredEvents = explorarEventos(EVENTS, activeFilter);

  // Region center (mocked to Brasília)
  const initialRegion = {
    latitude: -15.7942,
    longitude: -47.8821,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const renderEventCard = ({ item }) => {
    // Accessibility Label for screen readers
    const accessibilityLabel = `Evento: ${item.titulo}. Local: ${item.local}, ${item.localizacao_geografica.descricao_espacial}. Acessibilidade disponível: ${item.tipo_de_acessibilidade.join(', ')}. Clique para ver mais detalhes.`;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Navega para a tela de detalhes do evento."
      >
        <Image source={item.image} style={styles.eventImage} resizeMode="cover" />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.titulo}</Text>
          <Text style={styles.eventLocal}>{item.local}</Text>
          
          <View style={styles.eventMeta}>
            <MapPin size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.eventDistance}>{item.distancia_mock_km} km</Text>
            <Text style={styles.eventDistanceText}>{item.localizacao_geografica.descricao_espacial}</Text>
          </View>

          <View style={styles.tagsContainer}>
            {item.tipo_de_acessibilidade.map((tag, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
      {/* ───── HEADER & FILTERS ───── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>

        
        {/* Toggle Map/List */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'map' }}
            accessibilityLabel="Visualização em Mapa"
          >
            <View style={styles.toggleBtnContent}>
              <MapIcon size={16} color={viewMode === 'map' ? COLORS.primary : COLORS.white} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Mapa</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === 'list' }}
            accessibilityLabel="Visualização em Lista"
          >
            <View style={styles.toggleBtnContent}>
              <List size={16} color={viewMode === 'list' ? COLORS.primary : COLORS.white} style={{ marginRight: 6 }} />
              <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>Lista</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ───── CONTENT ───── */}
      <View style={styles.content}>
        {viewMode === 'map' ? (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={true}
            accessible={true}
            accessibilityLabel="Mapa interativo mostrando eventos culturais próximos"
          >
            {filteredEvents.map(event => (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: event.localizacao_geografica.latitude,
                  longitude: event.localizacao_geografica.longitude,
                }}
                accessible={true}
                accessibilityLabel={`Marcador para o evento ${event.titulo} no ${event.local}`}
                onCalloutPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
              >
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{event.titulo}</Text>
                    <Text style={styles.calloutSubtitle}>{event.local}</Text>
                    <View style={styles.calloutA11yRow}>
                      <Accessibility size={12} color={COLORS.success} style={{ marginRight: 4 }} />
                      <Text style={styles.calloutA11y}>{event.tipo_de_acessibilidade.join(', ')}</Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={item => item.id}
            renderItem={renderEventCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            accessible={true}
            accessibilityLabel="Lista de eventos culturais filtrados por acessibilidade"
          />
        )}
      </View>

      {/* ───── BOTTOM NAV ───── */}
      <BottomNavBar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') navigation.navigate('Home');
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
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    color: COLORS.white,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    padding: 4,
    marginTop: SPACING.xs,
  },
  toggleBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.white,
    ...SHADOW.card,
  },
  toggleText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  listContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOW.card,
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  eventInfo: {
    padding: SPACING.md,
  },
  eventTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  eventLocal: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDistance: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
  },
  eventDistanceText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  calloutContainer: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    ...SHADOW.card,
  },
  calloutTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calloutSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  calloutA11yRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutA11y: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
    fontWeight: '700',
  }
});
