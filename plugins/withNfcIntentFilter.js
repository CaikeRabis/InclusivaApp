const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Plugin Expo customizado para injetar o intent-filter de NFC
 * diretamente no AndroidManifest.xml.
 *
 * O Expo NÃO processa corretamente ações como
 * "android.nfc.action.NDEF_DISCOVERED" através do app.json.
 * Este plugin resolve isso escrevendo o XML nativo correto.
 */
function withNfcIntentFilter(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    // Encontra o bloco <application>
    const application = manifest.manifest.application?.[0];
    if (!application) return config;

    // Encontra a MainActivity
    const mainActivity = application.activity?.find(
      (activity) => activity.$?.['android:name'] === '.MainActivity'
    );
    if (!mainActivity) return config;

    // ─── 1. Força launchMode="singleTask" ────────────────────────────
    // Necessário para que o Android reutilize a Activity existente
    // ao invés de criar uma nova instância quando o NFC acorda o app.
    mainActivity.$['android:launchMode'] = 'singleTask';

    // ─── 2. Garante que o array de intent-filters existe ─────────────
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    // ─── 3. Verifica se o filtro NDEF já existe (evita duplicatas) ────
    const alreadyHasNdef = mainActivity['intent-filter'].some((filter) => {
      return filter.action?.some(
        (a) => a.$?.['android:name'] === 'android.nfc.action.NDEF_DISCOVERED'
      );
    });

    if (!alreadyHasNdef) {
      // Injeta o intent-filter de NFC com MIME type customizado
      mainActivity['intent-filter'].push({
        action: [
          { $: { 'android:name': 'android.nfc.action.NDEF_DISCOVERED' } },
        ],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
        ],
        data: [
          { $: { 'android:mimeType': 'application/vnd.inclusiva' } },
        ],
      });
    }

    return config;
  });
}

module.exports = withNfcIntentFilter;
