import { NativeModules } from 'react-native';

// Injeta um mock do NfcManager caso o módulo nativo não exista (ex: rodando no Expo Go)
// Isso previne que a biblioteca 'react-native-nfc-manager' cause um crash fatal
// ("Invariant Violation: NativeEventEmitter") na inicialização do app.
if (!NativeModules.NfcManager) {
  NativeModules.NfcManager = {
    start: () => Promise.resolve(),
    isSupported: () => Promise.resolve(false),
    addListener: () => {},
    removeListeners: () => {},
  };
}
