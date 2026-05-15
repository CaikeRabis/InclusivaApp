import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Modal, useWindowDimensions,
  SafeAreaView, StatusBar, Switch, Animated,
} from 'react-native';
import { Accessibility, Search, X, Settings, ChevronLeft } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../styles/theme';
import { getAllObras, addObra, updateObra, deleteObra } from '../data/obras';

const ADMIN_BLUE = '#0047BB';
const SIDEBAR_W = 240;

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
};

const emptyForm = () => ({
  id: '', titulo: '', autor: '', resumo: '', status: 'ativo',
  recursos: { libras: false, audio: false, tatil: false },
});

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type === 'error' ? COLORS.paid : COLORS.success;
  return (
    <View style={[toastStyles.wrap, { backgroundColor: bg }]}>
      <Text style={toastStyles.text}>{msg}</Text>
    </View>
  );
}
const toastStyles = StyleSheet.create({
  wrap: { position: 'absolute', top: 20, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.full, zIndex: 999, ...SHADOW.strong },
  text: { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.sm },
});

// ── Badge ────────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const active = status === 'ativo';
  return (
    <View style={[badgeS.wrap, { backgroundColor: active ? '#D1FAE5' : '#FEE2E2' }]}>
      <View style={[badgeS.dot, { backgroundColor: active ? COLORS.success : COLORS.paid }]} />
      <Text style={[badgeS.label, { color: active ? '#065F46' : '#991B1B' }]}>
        {active ? 'Ativo' : 'Inativo'}
      </Text>
    </View>
  );
}
const badgeS = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
});

// ── Recursos chips ────────────────────────────────────────────────────────────
function RecursoChips({ recursos }) {
  const list = [
    recursos?.libras && 'LIBRAS',
    recursos?.audio && 'Áudio',
    recursos?.tatil && 'Tátil',
  ].filter(Boolean);
  if (!list.length) return <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>—</Text>;
  return (
    <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
      {list.map((r) => (
        <View key={r} style={chipS.chip}>
          <Text style={chipS.text}>{r}</Text>
        </View>
      ))}
    </View>
  );
}
const chipS = StyleSheet.create({
  chip: { backgroundColor: '#EEF2FF', borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontSize: FONTS.sizes.xs, color: ADMIN_BLUE, fontWeight: '600' },
});

// ── KPI Cards ─────────────────────────────────────────────────────────────────
function KPICards({ obras }) {
  const total = obras.length;
  const ativos = obras.filter((o) => o.status === 'ativo').length;
  const recursos = obras.filter((o) => o.recursos?.libras || o.recursos?.audio || o.recursos?.tatil).length;
  const cards = [
    { label: 'Total de Obras', value: total, color: ADMIN_BLUE },
    { label: 'Obras Ativas', value: ativos, color: COLORS.success },
    { label: 'Com Recursos', value: recursos, color: '#7C3AED' },
  ];
  return (
    <View style={kpiS.row}>
      {cards.map((c) => (
        <View key={c.label} style={[kpiS.card, SHADOW.card]}>
          <Text style={[kpiS.value, { color: c.color }]}>{c.value}</Text>
          <Text style={kpiS.label}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}
const kpiS = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl, flexWrap: 'wrap' },
  card: { flex: 1, minWidth: 100, backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  value: { fontSize: FONTS.sizes.xxxl, fontWeight: '800' },
  label: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
});

// ── Sidebar (desktop only) ────────────────────────────────────────────────────
function Sidebar() {
  return (
    <View style={sideS.wrap}>
      <View style={sideS.logoArea}>
        <Text style={sideS.logoText}>Inclusiva</Text>
        <Text style={sideS.logoSub}>Gestão de Acervo</Text>
      </View>
      {['Obras', 'Locais', 'Configurações'].map((item, i) => (
        <View key={item} style={[sideS.navItem, i === 0 && sideS.navActive]}>
          <Text style={[sideS.navLabel, i === 0 && sideS.navLabelActive]}>{item}</Text>
        </View>
      ))}
      <View style={sideS.footer}>
        <Text style={sideS.version}>v1.0.0 — Protótipo</Text>
      </View>
    </View>
  );
}
const sideS = StyleSheet.create({
  wrap: { width: SIDEBAR_W, backgroundColor: ADMIN_BLUE, paddingTop: 40, paddingBottom: 20, justifyContent: 'flex-start' },
  logoArea: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xxl },
  logoText: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '800' },
  logoSub: { color: 'rgba(255,255,255,0.65)', fontSize: FONTS.sizes.xs, marginTop: 2 },
  navItem: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, marginHorizontal: SPACING.md, borderRadius: RADIUS.md, marginBottom: 4 },
  navActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  navLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FONTS.sizes.md, fontWeight: '500' },
  navLabelActive: { color: '#fff', fontWeight: '700' },
  footer: { marginTop: 'auto', paddingHorizontal: SPACING.lg },
  version: { color: 'rgba(255,255,255,0.4)', fontSize: FONTS.sizes.xs },
});

// ── Form Modal ────────────────────────────────────────────────────────────────
function ObraFormModal({ visible, obra, onClose, onSave }) {
  const [form, setForm] = useState(obra || emptyForm());
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  React.useEffect(() => { setForm(obra || emptyForm()); }, [obra]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setRecurso = (k, v) => setForm((f) => ({ ...f, recursos: { ...f.recursos, [k]: v } }));

  const labelStyle = { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, marginTop: SPACING.md };
  const inputStyle = { borderWidth: 1.5, borderColor: '#E2E8F4', borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, backgroundColor: '#FAFCFF' };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={formS.overlay}>
        <View style={[formS.sheet, isDesktop && formS.sheetDesktop]}>
          <View style={formS.header}>
            <Text style={formS.title}>{obra?.id ? 'Editar Obra' : 'Nova Obra'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={formS.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={labelStyle}>ID NFC *</Text>
            <TextInput style={inputStyle} value={form.id} onChangeText={(v) => set('id', v)} placeholder="Ex: 11" editable={!obra?.id} keyboardType="numeric" />

            <Text style={labelStyle}>Título *</Text>
            <TextInput style={inputStyle} value={form.titulo} onChangeText={(v) => set('titulo', v)} placeholder="Título da obra" />

            <Text style={labelStyle}>Autor *</Text>
            <TextInput style={inputStyle} value={form.autor} onChangeText={(v) => set('autor', v)} placeholder="Nome do artista ou coletivo" />

            <Text style={labelStyle}>Audiodescrição *</Text>
            <TextInput
              style={[inputStyle, { minHeight: 120, textAlignVertical: 'top', paddingTop: SPACING.md }]}
              value={form.resumo} onChangeText={(v) => set('resumo', v)}
              placeholder="Descreva a obra de forma sensorial e humanizada para o público com deficiência visual..."
              multiline numberOfLines={5}
            />

            <Text style={labelStyle}>Recursos de Acessibilidade</Text>
            {[['libras', 'LIBRAS (Língua de Sinais)'], ['audio', 'Áudio / Narração'], ['tatil', 'Experiência Tátil']].map(([k, label]) => (
              <View key={k} style={formS.checkRow}>
                <Switch
                  value={!!form.recursos?.[k]}
                  onValueChange={(v) => setRecurso(k, v)}
                  trackColor={{ false: '#E2E8F4', true: ADMIN_BLUE }}
                  thumbColor="#fff"
                />
                <Text style={formS.checkLabel}>{label}</Text>
              </View>
            ))}

            <Text style={labelStyle}>Status</Text>
            <View style={formS.checkRow}>
              <Switch
                value={form.status === 'ativo'}
                onValueChange={(v) => set('status', v ? 'ativo' : 'inativo')}
                trackColor={{ false: '#E2E8F4', true: COLORS.success }}
                thumbColor="#fff"
              />
              <Text style={formS.checkLabel}>{form.status === 'ativo' ? 'Ativo' : 'Inativo'}</Text>
            </View>

            <View style={formS.actions}>
              <TouchableOpacity style={formS.cancelBtn} onPress={onClose}>
                <Text style={formS.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={formS.saveBtn} onPress={() => onSave(form)}>
                <Text style={formS.saveText}>Salvar Obra</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const formS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  sheet: { backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.xl, width: '100%', maxHeight: '90%' },
  sheetDesktop: { maxWidth: 600 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  closeBtn: { fontSize: 20, color: COLORS.textMuted, padding: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginVertical: 6 },
  checkLabel: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl, marginBottom: SPACING.md },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E2E8F4', borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: FONTS.sizes.md },
  saveBtn: { flex: 2, backgroundColor: ADMIN_BLUE, borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md },
});

// ── Table Row (desktop) ───────────────────────────────────────────────────────
function TableRow({ obra, onEdit, onDelete, isEven }) {
  return (
    <View style={[tableS.row, isEven && tableS.rowEven]}>
      <Text style={[tableS.cell, tableS.cellId]} numberOfLines={1}>{obra.id}</Text>
      <Text style={[tableS.cell, { flex: 3 }]} numberOfLines={1}>{obra.titulo}</Text>
      <Text style={[tableS.cell, { flex: 2 }]} numberOfLines={1}>{obra.autor}</Text>
      <Text style={[tableS.cell, { flex: 1.5 }]}>{fmt(obra.createdAt)}</Text>
      <View style={[tableS.cellView, { flex: 1.5 }]}><StatusBadge status={obra.status} /></View>
      <View style={[tableS.cellView, { flex: 2 }]}><RecursoChips recursos={obra.recursos} /></View>
      <View style={[tableS.cellView, tableS.cellActions]}>
        <TouchableOpacity style={tableS.editBtn} onPress={() => onEdit(obra)}>
          <Text style={tableS.editText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tableS.deleteBtn} onPress={() => onDelete(obra)}>
          <Text style={tableS.deleteText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const tableS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  rowEven: { backgroundColor: '#FAFCFF' },
  cell: { flex: 2, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary },
  cellId: { flex: 0.8, fontWeight: '700', color: ADMIN_BLUE },
  cellView: { flex: 2, flexDirection: 'row', flexWrap: 'wrap' },
  cellActions: { flex: 2, gap: 6, justifyContent: 'flex-end' },
  editBtn: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: ADMIN_BLUE },
  editText: { color: ADMIN_BLUE, fontWeight: '600', fontSize: FONTS.sizes.xs },
  deleteBtn: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.sm, backgroundColor: '#FEE2E2' },
  deleteText: { color: COLORS.paid, fontWeight: '600', fontSize: FONTS.sizes.xs },
});

// ── Mobile Card ───────────────────────────────────────────────────────────────
function ObraCard({ obra, onEdit, onDelete }) {
  return (
    <View style={[cardS.wrap, SHADOW.card]}>
      <View style={cardS.top}>
        <View style={{ flex: 1 }}>
          <Text style={cardS.title} numberOfLines={1}>{obra.titulo}</Text>
          <Text style={cardS.author}>{obra.autor}</Text>
        </View>
        <StatusBadge status={obra.status} />
      </View>
      <View style={cardS.meta}>
        <Text style={cardS.metaText}>ID: <Text style={{ color: ADMIN_BLUE, fontWeight: '700' }}>{obra.id}</Text></Text>
        <Text style={cardS.metaText}>Criação: {fmt(obra.createdAt)}</Text>
      </View>
      <RecursoChips recursos={obra.recursos} />
      <View style={cardS.actions}>
        <TouchableOpacity style={tableS.editBtn} onPress={() => onEdit(obra)}>
          <Text style={tableS.editText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tableS.deleteBtn} onPress={() => onDelete(obra)}>
          <Text style={tableS.deleteText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const cardS = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SPACING.sm },
  title: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  author: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.sm },
  metaText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md, justifyContent: 'flex-end' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AdminScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [obras, setObras] = useState(() => getAllObras());
  const [query, setQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingObra, setEditingObra] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const refresh = () => setObras(getAllObras());

  const filtered = obras.filter(
    (o) =>
      o.titulo.toLowerCase().includes(query.toLowerCase()) ||
      String(o.id).includes(query) ||
      o.autor.toLowerCase().includes(query.toLowerCase())
  );

  const handleSave = (form) => {
    try {
      if (editingObra) {
        updateObra(editingObra.id, form);
        showToast('Obra atualizada com sucesso!');
      } else {
        addObra(form);
        showToast('Obra cadastrada com sucesso!');
      }
      refresh();
      setModalVisible(false);
      setEditingObra(null);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = (obra) => {
    try {
      deleteObra(obra.id);
      refresh();
      showToast(`"${obra.titulo}" excluída.`);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleEdit = (obra) => {
    setEditingObra(obra);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingObra(null);
    setModalVisible(true);
  };

  const mainContent = (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={mainS.header}>
        {isDesktop && (
          <TouchableOpacity style={mainS.backBtnDesktop} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ChevronLeft size={20} color={ADMIN_BLUE} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={mainS.pageTitle}>Gestão de Acervo</Text>
          <Text style={mainS.pageSubtitle}>{obras.length} obras cadastradas</Text>
        </View>
        <TouchableOpacity style={mainS.addBtn} onPress={handleAdd}>
          <Text style={mainS.addBtnText}>+ Adicionar Obra</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={mainS.searchWrap}>
        <TextInput
          style={mainS.searchInput}
          placeholder="Buscar por título, ID NFC ou autor..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* KPI */}
      <KPICards obras={obras} />

      {/* Table (desktop) / Cards (mobile) */}
      {isDesktop ? (
        <View style={[mainS.tableWrap, SHADOW.card]}>
          {/* Table header */}
          <View style={[tableS.row, mainS.tableHead]}>
            {[['ID NFC', 0.8], ['Título', 3], ['Autor', 2], ['Criação', 1.5], ['Status', 1.5], ['Recursos', 2], ['Ações', 2]].map(([label, flex]) => (
              <Text key={label} style={[mainS.thText, { flex }]}>{label}</Text>
            ))}
          </View>
          <ScrollView>
            {filtered.map((o, i) => (
              <TableRow key={o.id} obra={o} isEven={i % 2 === 0} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
            {filtered.length === 0 && (
              <View style={mainS.empty}><Text style={mainS.emptyText}>Nenhuma obra encontrada.</Text></View>
            )}
          </ScrollView>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filtered.map((o) => (
            <ObraCard key={o.id} obra={o} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
          {filtered.length === 0 && (
            <View style={mainS.empty}><Text style={mainS.emptyText}>Nenhuma obra encontrada.</Text></View>
          )}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={mainS.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={ADMIN_BLUE} />
      <Toast msg={toast.msg} type={toast.type} />

      <View style={mainS.root}>
        {isDesktop && <Sidebar />}
        <ScrollView
          style={mainS.scrollArea}
          contentContainerStyle={mainS.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!isDesktop && (
            <View style={mainS.mobileTopBar}>
              <TouchableOpacity onPress={() => navigation?.goBack()}>
                <Text style={mainS.backBtn}>← Voltar</Text>
              </TouchableOpacity>
              <Text style={mainS.mobileTitle}>Gestão de Acervo</Text>
              <View style={{ width: 60 }} />
            </View>
          )}
          {mainContent}
        </ScrollView>
      </View>

      {/* Mobile FAB */}
      {!isDesktop && (
        <TouchableOpacity style={mainS.fab} onPress={handleAdd}>
          <Text style={mainS.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <ObraFormModal
        visible={modalVisible}
        obra={editingObra}
        onClose={() => { setModalVisible(false); setEditingObra(null); }}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const mainS = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F4F8' },
  root: { flex: 1, flexDirection: 'row' },
  scrollArea: { flex: 1 },
  scrollContent: { padding: SPACING.xl, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  pageTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary },
  pageSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: { backgroundColor: ADMIN_BLUE, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md },
  searchWrap: { marginBottom: SPACING.xl },
  searchInput: { backgroundColor: '#fff', borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, borderWidth: 1.5, borderColor: '#E2E8F4' },
  tableWrap: { backgroundColor: '#fff', borderRadius: RADIUS.lg, overflow: 'hidden' },
  tableHead: { backgroundColor: '#F8FAFF', borderBottomWidth: 2, borderBottomColor: '#E2E8F4' },
  thText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { padding: SPACING.xxl, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
  backBtnDesktop: {
    marginRight: SPACING.md,
    padding: 6,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  mobileTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  mobileTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  backBtn: { color: ADMIN_BLUE, fontSize: FONTS.sizes.md, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: ADMIN_BLUE, alignItems: 'center', justifyContent: 'center', ...SHADOW.strong },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
