import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS, RADIUS, SHADOW } from '../styles/theme';

/**
 * VLibrasPlayer — renderiza o avatar 3D do VLibras dentro de uma WebView
 * e força a tradução automática do texto recebido via props.
 *
 * @param {string}  texto       - Texto em português para traduzir em Libras.
 * @param {number}  [height=300] - Altura do container do avatar.
 */
export default function VLibrasPlayer({ texto, height = 300 }) {
  const webviewRef = useRef(null);

  // Escapa aspas e quebras de linha para injeção segura em JS
  const escapeForJS = (str) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };

  // HTML inline que carrega o VLibras Widget
  const htmlSource = useMemo(() => {
    const escapedTexto = escapeForJS(texto);

    return `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ─── Container do texto-alvo (acessível ao DOM mas invisível) ─── */
    #obra-text {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      opacity: 0.01;
      overflow: hidden;
      pointer-events: none;
      font-size: 16px;
      color: #000;
    }

    /* ─── Forçar o widget VLibras a ocupar toda a viewport ─── */
    [vw] {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      z-index: 9999 !important;
    }

    /* Esconder o botão flutuante padrão (não precisamos dele) */
    [vw-access-button] {
      display: none !important;
    }

    /* Expandir o wrapper do plugin para tela cheia */
    [vw-plugin-wrapper] {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: transparent !important;
    }

    .vw-plugin-top-wrapper {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    /* ─── Status feedback ─── */
    #status-label {
      position: fixed;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      color: rgba(0,0,0,0.35);
      z-index: 99999;
      text-align: center;
      pointer-events: none;
      white-space: nowrap;
    }
  </style>
</head>
<body>

  <!-- Texto da obra (oculto, usado para seleção programática) -->
  <div id="obra-text">${escapedTexto}</div>

  <!-- Estrutura obrigatória do VLibras Widget -->
  <div vw class="enabled">
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper>
      <div class="vw-plugin-top-wrapper"></div>
    </div>
  </div>

  <div id="status-label">Carregando VLibras...</div>

  <!-- Script oficial do VLibras -->
  <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
  <script>
    var widgetReady = false;

    // Inicializa o widget
    try {
      new window.VLibras.Widget('https://vlibras.gov.br/app');
      document.getElementById('status-label').textContent = 'Inicializando avatar...';
    } catch(e) {
      document.getElementById('status-label').textContent = 'Erro ao carregar VLibras';
    }

    /**
     * Força a tradução simulando seleção de texto.
     */
    function forceTranslate() {
      try {
        var el = document.getElementById('obra-text');
        if (!el || !el.textContent.trim()) return;

        // 1. Limpa seleção atual
        var sel = window.getSelection();
        sel.removeAllRanges();

        // 2. Cria nova seleção
        var range = document.createRange();
        range.selectNodeContents(el);
        sel.addRange(range);

        // 3. Dispara mouseup para o VLibras capturar
        var evt = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        
        el.dispatchEvent(evt);
        document.dispatchEvent(evt);

        document.getElementById('status-label').textContent = 'Traduzindo...';

        // 3. Fallback: tentar novamente com clique no botão do widget
        setTimeout(function() {
          var btn = document.querySelector('[vw-access-button]');
          if (btn) {
            btn.style.display = 'block';
            btn.click();
            setTimeout(function() {
              btn.style.display = 'none';
              // Re-selecionar
              sel.removeAllRanges();
              sel.addRange(range);
              el.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true, cancelable: true, view: window
              }));
            }, 500);
          }
        }, 1000);

        setTimeout(function() {
          document.getElementById('status-label').textContent = '';
        }, 5000);

      } catch(e) {
        document.getElementById('status-label').textContent = 'Erro na tradução';
      }
    }

    /**
     * Atualiza o texto do <p> e re-dispara a tradução.
     * Chamado via injectJavaScript do React Native.
     */
    function updateText(newText) {
      var el = document.getElementById('obra-text');
      if (el) {
        el.textContent = newText;
        setTimeout(forceTranslate, 2000);
      }
    }

    // Auto-traduzir após o widget ter tempo de carregar (~4s)
    setTimeout(forceTranslate, 4000);
  </script>

</body>
</html>
    `;
  }, [texto]);

  // Quando o texto muda externamente, injeta o novo texto na WebView
  useEffect(() => {
    if (webviewRef.current && texto) {
      const escaped = escapeForJS(texto);
      webviewRef.current.injectJavaScript(`
        updateText("${escaped}");
        true;
      `);
    }
  }, [texto]);

  if (!texto) return null;

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webviewRef}
        source={{ html: htmlSource, baseUrl: 'https://vlibras.gov.br' }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
        incognito={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Fundo transparente no Android
        androidLayerType="hardware"
        // Suporte a WebGL (necessário para o avatar 3D)
        allowsFullscreenVideo={false}
        onError={(syntheticEvent) => {
          console.warn('VLibras WebView Error:', syntheticEvent.nativeEvent.description);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#F0F4F8',
    ...SHADOW.card,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
