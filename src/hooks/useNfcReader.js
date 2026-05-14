import { useState, useEffect } from 'react';

// Mock padrão para usar no Expo Go
let NfcManager = {
  start: () => Promise.resolve(),
  isSupported: () => Promise.resolve(false),
  registerTagEvent: () => Promise.resolve(),
  unregisterTagEvent: () => Promise.resolve(),
  setEventListener: () => {},
};

let NfcEvents = {
  DiscoverTag: 'DiscoverTag',
  SessionClosed: 'SessionClosed'
};

try {
  // Tentamos carregar a biblioteca nativa.
  // No Expo Go, a falta do NativeModule fará isso dar um throw (Invariant Violation).
  // Nós capturamos esse erro e deixamos o app continuar rodando com o mock acima.
  const nfcModule = require('react-native-nfc-manager');
  if (nfcModule && nfcModule.default) {
    NfcManager = nfcModule.default;
    NfcEvents = nfcModule.NfcEvents || NfcEvents;
  }
} catch (error) {
  console.log('Ambiente sem hardware NFC nativo detectado (ex: Expo Go). Usando modo simulação.');
}

export function useNfcReader() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedId, setScannedId] = useState(null);
  const [error, setError] = useState(null);
  const [nfcSupported, setNfcSupported] = useState(true);

  useEffect(() => {
    async function initNfc() {
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

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.setEventListener(NfcEvents.SessionClosed, null);
    };
  }, []);

  const startScanning = async () => {
    if (!nfcSupported) {
      setError('Dispositivo não possui suporte NFC (ou não está ativado).');
      return;
    }

    setIsScanning(true);
    setScannedId(null);
    setError(null);

    try {
      // Usar registro de eventos nativos
      await NfcManager.registerTagEvent();

      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
        // Tentamos ler o ID da tag (simulando que está no campo 'id' ou que pegamos um dado do payload NDEF)
        // Aqui assumimos que o ID da tag é passado na payload. Para simplificar em tags de texto puro:
        // A lógica real dependeria do formato NDEF escrito.
        // Vamos extrair o ID de forma simulada do objeto tag caso não seja claro,
        // ou você pode ter gravado o ID (1 a 10) na tag.
        
        // Exemplo simplificado: assumindo que a tag devolve um id de 1 a 10
        let readId = "1"; // Default mockup
        
        if (tag.ndefMessage && tag.ndefMessage.length > 0) {
          const payload = tag.ndefMessage[0].payload;
          // Converter bytes do payload para string
          // Pula os primeiros bytes dependendo do language code (ex: 'en')
          const textBytes = payload.slice(3);
          const text = String.fromCharCode.apply(null, textBytes);
          
          if (!isNaN(parseInt(text))) {
            readId = text.trim();
          }
        }

        setScannedId(readId);
        NfcManager.unregisterTagEvent().catch(() => 0);
        setIsScanning(false);
      });

    } catch (ex) {
      console.warn('Erro ao iniciar NFC:', ex);
      setError('Falha ao tentar ler a tag NFC.');
      setIsScanning(false);
      NfcManager.unregisterTagEvent().catch(() => 0);
    }
  };

  const cancelScanning = async () => {
    try {
      await NfcManager.unregisterTagEvent();
    } catch (ex) {}
    setIsScanning(false);
  };

  // Função para simular a leitura caso o usuário clique no "Botão de Simulação" (Para Expo Go / Testes sem tag física)
  const simulateScan = () => {
    setIsScanning(true);
    setError(null);
    
    // Simula 2 segundos de "leitura"
    setTimeout(() => {
      // Retorna um ID aleatório entre 1 e 12 (incluindo 11 e 12 para testar o erro de "obra não encontrada")
      const randomId = Math.floor(Math.random() * 12) + 1;
      setScannedId(randomId.toString());
      setIsScanning(false);
    }, 2000);
  };

  return {
    isScanning,
    scannedId,
    error,
    startScanning,
    cancelScanning,
    simulateScan,
    nfcSupported,
  };
}
