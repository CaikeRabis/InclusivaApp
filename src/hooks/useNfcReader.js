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
      await NfcManager.requestTechnology(NfcTech.Ndef);
      const tag = await NfcManager.getTag();
      
      let readId = '1'; // Fallback

      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const record = tag.ndefMessage[0];
        const tnf = record.tnf;       // Type Name Format
        const type = record.type;     // Tipo do registro
        const payload = record.payload;

        // ── URI Record (TNF=1, type=[0x55]='U') ─────────────────────────────
        const isUriRecord = tnf === 1 && type && type.length === 1 && type[0] === 0x55;

        // ── Text Record (TNF=1, type=[0x54]='T') ─────────────────────────────
        const isTextRecord = tnf === 1 && type && type.length === 1 && type[0] === 0x54;

        // ── MIME Record (TNF=2) ──────────────────────────────────────────────
        const isMimeRecord = tnf === 2;

        if (isUriRecord) {
          // Pula o byte de identifier (1 byte) e lê o URI completo
          const uriBytes = payload.slice(1);
          const fullUri = String.fromCharCode.apply(null, uriBytes);
          const parts = fullUri.replace('inclusiva://obra/', '').replace('obra/', '').split('/');
          const candidate = parts[parts.length - 1].trim();
          if (candidate && !isNaN(parseInt(candidate))) {
            readId = candidate;
          } else if (candidate) {
            readId = candidate;
          }
        } else if (isTextRecord) {
          // Pula status byte (1) + language code (status_byte & 0x3F bytes)
          const statusByte = payload[0];
          const langCodeLength = statusByte & 0x3f;
          const textBytes = payload.slice(1 + langCodeLength);
          const text = String.fromCharCode.apply(null, textBytes).trim();
          readId = text || tag.id || '1';
        } else if (isMimeRecord) {
          // Payload do MIME type é direto o texto que enviamos
          const text = String.fromCharCode.apply(null, payload).trim();
          readId = text || tag.id || '1';
        } else {
          // Fallback: tenta decodificar o payload como texto bruto
          const rawText = String.fromCharCode.apply(null, payload).trim();
          readId = rawText || tag.id || '1';
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
