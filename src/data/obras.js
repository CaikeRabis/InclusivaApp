// ─── Mapa de obras em memória (fonte de verdade do protótipo) ────────────────
// Ao reiniciar o app, os dados do mock original são restaurados.
let OBRAS_MAP = {
  '1': {
    id: '1',
    titulo: 'A Dança das Formas',
    autor: 'Marina Silva',
    resumo:
      'Uma escultura tátil que explora o movimento geométrico. A obra possui curvas suaves em aço inoxidável, permitindo que a luz crie padrões dinâmicos. Ao tocá-la, sente-se a transição da textura lisa para a áspera na base.',
    createdAt: '2024-03-10T10:00:00.000Z',
    status: 'ativo',
    recursos: { libras: true, audio: true, tatil: true },
  },
  '2': {
    id: '2',
    titulo: 'O Som da Cidade',
    autor: 'Coletivo Ruidoso',
    resumo:
      'Instalação sonora interativa. Sons cotidianos de Brasília são mixados em uma sinfonia contínua. Elementos de percussão acompanham o ritmo do trânsito do Eixão.',
    createdAt: '2024-03-15T14:00:00.000Z',
    status: 'ativo',
    recursos: { libras: false, audio: true, tatil: false },
  },
  '3': {
    id: '3',
    titulo: 'Raízes do Cerrado',
    autor: 'Carlos Mendes',
    resumo:
      'Pintura em alto relevo utilizando pigmentos naturais da terra. Retrata a resistência das árvores do cerrado com troncos tortuosos, onde cada ranhura pode ser acompanhada pelo toque dos dedos.',
    createdAt: '2024-04-02T09:30:00.000Z',
    status: 'ativo',
    recursos: { libras: false, audio: true, tatil: true },
  },
  '4': {
    id: '4',
    titulo: 'Janelas da Alma',
    autor: 'Helena Ramos',
    resumo:
      'Série de retratos fotográficos convertidos em matrizes 3D. A obra convida a perceber as expressões faciais através da textura das testas franzidas e sorrisos largos.',
    createdAt: '2024-04-18T11:00:00.000Z',
    status: 'ativo',
    recursos: { libras: true, audio: false, tatil: true },
  },
  '5': {
    id: '5',
    titulo: 'Ventos de Agosto',
    autor: 'Lucas Neves',
    resumo:
      'Escultura móvel suspensa (móbile). Peças de madeira leve balançam suavemente, reproduzindo o som sutil do vento cruzando a arquitetura modernista.',
    createdAt: '2024-05-05T16:00:00.000Z',
    status: 'ativo',
    recursos: { libras: false, audio: true, tatil: false },
  },
  '6': {
    id: '6',
    titulo: 'Cores Ocultas',
    autor: 'Amanda Luz',
    resumo:
      'Painel sensorial. Cores quentes são representadas por texturas felpudas que emanam um leve calor, enquanto cores frias são feitas de metais lisos e refrescantes.',
    createdAt: '2024-05-20T10:00:00.000Z',
    status: 'inativo',
    recursos: { libras: false, audio: false, tatil: true },
  },
  '7': {
    id: '7',
    titulo: 'Ecos do Passado',
    autor: 'Instituto Memória',
    resumo:
      'Obra focada na audiodescrição imersiva. Conta a história da construção da capital através de fragmentos de áudio de trabalhadores da época.',
    createdAt: '2024-06-01T08:00:00.000Z',
    status: 'ativo',
    recursos: { libras: true, audio: true, tatil: false },
  },
  '8': {
    id: '8',
    titulo: 'O Abraço',
    autor: 'Thiago Ferraz',
    resumo:
      'Escultura de grandes dimensões em bronze com formato curvo e acolhedor. Convida o público a entrar em seu interior para experimentar uma mudança na acústica do ambiente.',
    createdAt: '2024-06-12T13:00:00.000Z',
    status: 'ativo',
    recursos: { libras: false, audio: true, tatil: true },
  },
  '9': {
    id: '9',
    titulo: 'Linhas do Horizonte',
    autor: 'Beatriz Nogueira',
    resumo:
      'Trabalho em braille expandido. Poemas sobre a vastidão do céu de Brasília gravados em grandes placas de acrílico iluminadas nas bordas.',
    createdAt: '2024-07-03T15:30:00.000Z',
    status: 'ativo',
    recursos: { libras: true, audio: false, tatil: true },
  },
  '10': {
    id: '10',
    titulo: 'Coração de Concreto',
    autor: 'Escola de Arquitetura',
    resumo:
      'Maquete tátil de um dos palácios da cidade. Permite a compreensão espacial da arquitetura moderna, com texturas diferenciadas para vidro, água e concreto.',
    createdAt: '2024-07-20T10:00:00.000Z',
    status: 'ativo',
    recursos: { libras: false, audio: true, tatil: true },
  },
};

// ─── Compatibilidade retroativa com OBRAS_MOCK ────────────────────────────────
export const OBRAS_MOCK = Object.fromEntries(
  Object.entries(OBRAS_MAP).map(([k, v]) => [
    k,
    { titulo: v.titulo, resumo: v.resumo, autor: v.autor },
  ])
);

// ─── Leitura ──────────────────────────────────────────────────────────────────
export const getObraById = (id) => OBRAS_MAP[String(id)] || null;

export const getAllObras = () => Object.values(OBRAS_MAP);

// ─── Escrita (em memória) ─────────────────────────────────────────────────────
export const addObra = (obra) => {
  const id = String(obra.id).trim();
  if (!id) throw new Error('ID NFC é obrigatório.');
  if (OBRAS_MAP[id]) throw new Error(`ID NFC "${id}" já está em uso.`);
  OBRAS_MAP[id] = {
    ...obra,
    id,
    createdAt: new Date().toISOString(),
    status: obra.status ?? 'ativo',
    recursos: obra.recursos ?? { libras: false, audio: false, tatil: false },
  };
  return OBRAS_MAP[id];
};

export const updateObra = (id, dados) => {
  const key = String(id);
  if (!OBRAS_MAP[key]) throw new Error(`Obra "${key}" não encontrada.`);
  OBRAS_MAP[key] = { ...OBRAS_MAP[key], ...dados, id: key };
  return OBRAS_MAP[key];
};

export const deleteObra = (id) => {
  const key = String(id);
  if (!OBRAS_MAP[key]) throw new Error(`Obra "${key}" não encontrada.`);
  delete OBRAS_MAP[key];
};
