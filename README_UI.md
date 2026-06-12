# Documentação de Interface e Acessibilidade (UI/UX) — Projeto Inclusiva

Este documento detalha a interface do usuário (UI), os padrões de design, e todos os recursos de acessibilidade implementados no aplicativo Inclusiva. É a referência principal para qualquer agente ou desenvolvedor que for trabalhar na melhoria da experiência para pessoas com deficiência visual (cegos/baixa visão) e deficiência auditiva (surdos).

---

## 1. Sistema de Design (Design Tokens)

Toda a identidade visual do app está centralizada em `src/styles/theme.js`.

| Token | Valor | Uso |
|-------|-------|-----|
| `COLORS.primary` | `#1A56DB` | Botões principais, header |
| `COLORS.primaryDark` | `#1240A8` | Status bar, SafeArea background |
| `COLORS.primaryLight` | `#2D6EF5` | Badges, botão de velocidade |
| `COLORS.white` | `#FFFFFF` | Textos em fundos coloridos |
| `COLORS.background` | `#F5F7FA` | Fundo das telas |
| `COLORS.textPrimary` | `#1A1A2E` | Textos principais |
| `COLORS.textSecondary` | `#6B7280` | Textos secundários/subtítulos |
| `COLORS.textMuted` | `#9CA3AF` | Placeholders, dicas |
| `COLORS.success` | `#10B981` | Confirmações, badges "AO VIVO" |

**Tipografia:** Tamanhos em `FONTS.sizes` (xs → xxl). Todos os textos usam `allowFontScaling` padrão do React Native (respeitam configuração de fonte do sistema).

---

## 2. Telas e Layout

### 2.1 HomeScreen — Tela Inicial

**Header:**
- Logo circular do app (Inclusiva)
- Saudação dinâmica baseada no horário local:
  - 00h–11h59 → **"Bom dia!"**
  - 12h–17h59 → **"Boa tarde!"**
  - 18h–23h59 → **"Boa noite!"**
- Subtítulo fixo: *"Seja bem-vindo(a)!"*
- Botão de acesso ao Admin (ícone ⚙️) e menu hambúrguer

**Conteúdo (ScrollView):**
- `FilterTabs` — filtros clicáveis por categoria de acessibilidade
- Seção "Destaques para você" com `PlaceCard` (cards grandes com imagem, badge de acessibilidade, botões de áudio e info)
- `TrailTimeline` — linha do tempo da trilha acessível guiada

**Rodapé:** `BottomNavBar` com 3 abas: Home, Explorar, Configurações

---

### 2.2 NFCScreen — Tela de Leitura NFC ⭐ (Tela Principal do App)

Esta é a tela central de acessibilidade. Suporta duas formas de ativação:
1. **Deep Link via tag NFC** (fluxo principal): celular entra em contato com a tag → app abre diretamente nessa tela com `nfcId` via `route.params`
2. **Scan manual**: usuário pressiona botão "Iniciar leitura NFC" na tela

**Layout da tela (fora do Modal):**
- Header com botão Voltar + nome do local
- Card com foto do local (quando `placeId` disponível)
- Ícone pulsante animado (rings de pulso) indicando status: Aguardando / Lendo / Concluído / Erro
- Lista de instruções em 3 passos
- Botão grande "Iniciar leitura NFC" / "Cancelar"

**Modal de Detalhes da Obra** (abre automaticamente ao detectar NFC):

```
┌─────────────────────────────────┐
│  Detalhes da Obra           [X] │
├─────────────────────────────────┤
│  [Título da Obra] ← foco auto   │  ← accessibilityRole="header"
│  Por [Autor]                    │
│                                 │
│  [Texto do resumo/descrição]    │
│                                 │
│  ┌─── Tradução em Libras ─ 🟢 ─┐│
│  │    Avatar 3D VLibras         ││
│  │    sinalizando o texto       ││
│  └─────────────────────────────┘│
│                                 │
│  [🔊 Ouvir Áudio] [🤟 Libras✓] │
│                                 │
│  Velocidade do Áudio: [1.0x]   │  ← cicla: 1.0 → 1.5 → 2.0
│                                 │
│  ✓ Modo Acessibilidade V4       │
└─────────────────────────────────┘
```

---

### 2.3 AdminScreen — Painel Administrativo

Painel interno para gestão de conteúdo, com CRUD completo via API:
- **Locais**: criar, editar, excluir centros culturais
- **Obras**: criar, editar, excluir obras de arte com vínculo ao Local e ao `nfcId` da tag

---

### 2.4 ExploreScreen, SettingsScreen, EventDetailScreen

Telas auxiliares de navegação. Todas usam `SafeAreaView` de `react-native-safe-area-context` para respeitar safe areas do dispositivo.

---

## 3. Recursos de Acessibilidade Implementados

### 3.1 Para Pessoas Cegas ou com Baixa Visão

#### ✅ VoiceOver / TalkBack (Leitores de Tela Nativos)
Todos os elementos interativos possuem:
- `accessible={true}`
- `accessibilityRole="button"` (ou `"header"` para títulos principais)
- `accessibilityLabel` descritivo em português (ex: *"Ouvir Audiodescrição. O leitor de tela narrará a descrição da obra."*)
- `accessibilityState={{ selected: true/false }}` em botões de toggle (Libras ✓)

#### ✅ Auto-Foco do Leitor de Tela ao Abrir Modal
**Problema resolvido:** Ao abrir o modal da obra, o TalkBack/VoiceOver ficava "perdido" em elementos do fundo da tela.

**Solução:** `useRef` no título da obra + `AccessibilityInfo.setAccessibilityFocus(findNodeHandle(titleRef.current))` disparado 500ms após o modal montar (aguarda animação de slide).

Resultado: o cursor do leitor de tela vai **diretamente para o título da obra**, sem o usuário precisar varrer a tela.

#### ✅ Text-to-Speech (TTS) com `expo-speech`
- Narra automaticamente `"Obra identificada: [título]. [resumo]"` ao detectar NFC
- Seleção inteligente de voz: prioriza vozes Enhanced pt-BR (iOS) ou Google pt-BR (Android)
- `onDone` e `onStopped` callbacks atualizam o estado `isSpeaking`
- Cold-start protection: delay de 300ms para garantir inicialização do engine TTS no Android após Deep Link

#### ✅ Controle de Velocidade de Fala
Estado `speechRate` (padrão: `1.0`). Botão no modal cicla entre:
- **1.0x** — Padrão (confortável para iniciantes)
- **1.5x** — Rápido
- **2.0x** — Ultra rápido (usuários experientes de leitor de tela)

Se o áudio estiver tocando quando a velocidade é alterada, ele **reinicia imediatamente** com a nova velocidade.

`accessibilityLabel` do botão anuncia: *"Velocidade atual: 1.5 vezes. Toque para alterar."*

#### ✅ Haptic Feedback
- `Haptics.notificationAsync(Success)` — ao confirmar leitura NFC
- `Haptics.impactAsync(Light)` — ao pressionar botão de áudio

---

### 3.2 Para Pessoas Surdas

#### ✅ Avatar 3D VLibras (`VLibrasPlayer.js`)
**Componente:** `src/components/VLibrasPlayer.js`

**Funcionamento técnico:**
- Renderiza uma `<WebView>` com HTML inline contendo o widget oficial do VLibras
- O texto da obra é inserido em um `<p id="obra-text">` oculto (`position: absolute; left: -9999px`)
- Após ~4 segundos (tempo de carregamento do widget Unity), um script injeta:
  ```javascript
  // Seleciona programaticamente o texto oculto
  range.selectNodeContents(el);
  sel.addRange(range);
  // Simula mouseup para ativar o listener do VLibras
  el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  ```
- **Fallback:** tenta clicar no botão interno do widget se a primeira tentativa falhar
- `injectJavaScript` atualiza o texto sem remontar a WebView quando a obra muda

**Props:**
- `texto` (string) — texto em português para traduzir
- `height` (number, padrão: 300) — altura do container

**Limitação:** requer conexão com `vlibras.gov.br`. Se offline, o card não renderiza (TTS continua funcionando normalmente).

#### ✅ Toggle Visual do Avatar
Botão "Libras ✓" / "Ver Libras" permite mostrar/esconder o avatar para economizar recursos. Estado `showLibras` (padrão: `true` — exibido por padrão).

---

### 3.3 Layout Adaptativo (Motor/Cognitivo/Baixa Visão)

#### ✅ Dynamic Font Scaling
Todos os botões do modal usam `paddingVertical` + `minWidth: 140` em vez de `height` fixo. Com `flexWrap: 'wrap'` no container, se o usuário tiver fonte grande no sistema, os botões simplesmente crescem para baixo sem cortar texto.

#### ✅ Safe Areas
`react-native-safe-area-context` em todas as telas — headers e rodapés nunca ficam escondidos atrás da notch, barra de status ou barra de gestos do sistema.

#### ✅ Touch Targets Amplos
Botões com `paddingVertical: SPACING.md` e mínimo de 44×44pt de área tocável, seguindo as diretrizes WCAG 2.5.5.

---

## 4. Fluxo Completo: Do Totem NFC à Experiência Acessível

```
[Celular encosta na tag NFC]
         ↓
[Android lê MIME: application/vnd.inclusiva + dados: "2"]
         ↓
[App abre NFCScreen com nfcId="2"]
         ↓
[API: GET /api/obras/nfc/2 → retorna obra completa]
         ↓
[Modal abre → AccessibilityInfo foca no Título]
         ↓
    ┌────┴────┐
    ▼         ▼
[TTS narra] [VLibras 3D sinaliza]
    (cegos)      (surdos)
```

---

## 5. O que Ainda Pode Ser Melhorado (Backlog de Acessibilidade)

| Item | Prioridade | Complexidade |
|------|-----------|--------------|
| Vídeos de onboarding em Libras (como usar o NFC) | Alta | Média |
| Modo de alto contraste (preto/amarelo para daltônicos) | Alta | Alta |
| Personalização de tom de voz do TTS (pitch) | Média | Baixa |
| `accessibilityHint` em mais elementos | Média | Baixa |
| Testes com usuários reais (cegos/surdos) com NVDA/TalkBack | Alta | — |
| Cache offline do texto da obra para VLibras sem internet | Média | Alta |
| Legendas/closed captions para conteúdos de áudio/vídeo | Baixa | Alta |
