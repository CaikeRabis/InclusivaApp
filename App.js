import React, { useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';

let NfcManager = null;
let NfcEvents = null;
try {
  const nfcModule = require('react-native-nfc-manager');
  NfcManager = nfcModule.default;
  NfcEvents = nfcModule.NfcEvents;
} catch (e) {
  console.log('NFC não suportado neste ambiente (Expo Go).');
}
import NFCScreen from './src/screens/NFCScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AdminScreen from './src/screens/AdminScreen';

import * as Linking from 'expo-linking';

const Stack = createNativeStackNavigator();

const prefix = Linking.createURL('/');

const linkingConfig = {
  prefixes: [prefix, 'inclusiva://'],
  config: {
    screens: {
      Home: 'home',
      Explore: 'explore',
      NFC: 'obra/:nfcId',
      Admin: 'admin',
    },
  },
};

export const navigationRef = createNavigationContainerRef();

export default function App() {
  
  useEffect(() => {
    async function setupBackgroundNfc() {
      if (!NfcManager) return;
      try {
        await NfcManager.start();
        
        // 1. Verifica tag de cold-start (quando o app estava fechado)
        const coldTag = await NfcManager.getBackgroundTag();
        if (coldTag) handleBackgroundTag(coldTag);

        // 2. Escuta tags em background (quando o app está minimizado)
        NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, (bgTag) => {
          if (bgTag) handleBackgroundTag(bgTag);
        });
      } catch (ex) {
        console.log('Erro ao configurar NFC Background:', ex);
      }
    }

    setupBackgroundNfc();

    return () => {
      if (NfcManager) {
        NfcManager.setEventListener(NfcEvents.DiscoverBackgroundTag, null);
      }
    };
  }, []);

  const handleBackgroundTag = (tag) => {
    let readId = null;
    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
      const record = tag.ndefMessage[0];
      if (record.tnf === 2) {
        // MIME Record: extrai o texto direto do payload
        readId = String.fromCharCode.apply(null, record.payload).trim();
      } else if (record.tnf === 1 && record.type && record.type[0] === 0x54) {
        // Text Record
        const statusByte = record.payload[0];
        const langCodeLength = statusByte & 0x3f;
        const textBytes = record.payload.slice(1 + langCodeLength);
        readId = String.fromCharCode.apply(null, textBytes).trim();
      }
    }
    
    if (!readId && tag.id) readId = tag.id;

    if (readId && navigationRef.isReady()) {
      navigationRef.navigate('NFC', { nfcId: readId });
    } else if (readId) {
      // Se a navegação não estiver pronta, aguarda um instante
      setTimeout(() => {
        if (navigationRef.isReady()) {
          navigationRef.navigate('NFC', { nfcId: readId });
        }
      }, 500);
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} linking={linkingConfig}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Explore" component={ExploreScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="NFC" component={NFCScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
