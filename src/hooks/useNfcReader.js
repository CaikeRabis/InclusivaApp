import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

let NfcManager = null;
let NfcTech = null;

try {
  // Tentamos carregar a biblioteca nativa.
  const nfcModule = require('react-native-nfc-manager');
  if (nfcModule && nfcModule.default) {
    NfcManager = nfcModule.default;
    NfcTech = nfcModule.NfcTech;
  }
} catch (error) {
  console.log('Ambiente sem hardware NFC nativo detectado (ex: PC/Web).');
}

export function useNfcReader() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedId, setScannedId] = useState(null);
  const [error, setError] = useState(null);
  const [nfcSupported, setNfcSupported] = useState(true);

  useEffect(() => {
    async function initNfc() {
      if (Platform.OS === 'web' || !NfcManager) {
        setNfcSupported(false);
        return;
      }
      try {
        const supported = await NfcManager.isSupported();
        setNfcSupported(supported);
        if (supported) {
          await NfcManager.start();
        }
      } catch (ex) {
        console.warn('NFC não suportado ou erro de inicialização:', ex);
        setNfcSupported(false);
      }
    }

    initNfc();
  }, []);

  const startScanning = async () => {
    if (Platform.OS === 'web' || !NfcManager || !nfcSupported) {
      setError('NFC Indisponível');
      return;
    }

    setIsScanning(true);
    setScannedId(null);
    setError(null);

    try {
      // Pede permissão ao usuário (no Android) ou exibe o modal do sistema (no iOS)
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      let readId = "1"; // Fallback
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const payload = tag.ndefMessage[0].payload;
        // Pula os primeiros bytes dependendo do language code
        const textBytes = payload.slice(3);
        const text = String.fromCharCode.apply(null, textBytes);
        
        if (!isNaN(parseInt(text))) {
          readId = text.trim();
        } else {
          readId = tag.id || "1";
        }
      } else if (tag.id) {
        readId = tag.id;
      }

      setScannedId(readId);
    } catch (ex) {
      console.warn('Erro ao ler tag NFC:', ex);
      setError('Falha ao tentar ler a tag NFC.');
    } finally {
      if (NfcManager) {
        NfcManager.cancelTechnologyRequest().catch(() => 0);
      }
      setIsScanning(false);
    }
  };

  const cancelScanning = async () => {
    if (NfcManager) {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch (ex) {}
    }
    setIsScanning(false);
  };

  return {
    isScanning,
    scannedId,
    error,
    startScanning,
    cancelScanning,
    nfcSupported,
  };
}
