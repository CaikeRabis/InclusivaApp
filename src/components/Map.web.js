import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Mock do MapView para Web (já que react-native-maps não suporta Web nativamente)
export default function MapView({ children, style }) {
  return (
    <View style={[style, styles.container]}>
      <Text style={styles.text}>🗺️ Mapa indisponível na Web</Text>
      <Text style={styles.subtext}>Por favor, teste pelo Expo Go no celular ou em um emulador Android/iOS.</Text>
    </View>
  );
}

// Mocks vazios para os filhos do mapa na Web
export const Marker = ({ children }) => <>{children}</>;
export const Callout = ({ children }) => <>{children}</>;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAEFF8', // Cor de fundo suave (theme surface)
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: '#E2E8F4',
    borderStyle: 'dashed',
    borderRadius: 16,
    margin: 16,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B35', // textPrimary
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#5A6A8A', // textSecondary
    textAlign: 'center',
    lineHeight: 20,
  }
});
