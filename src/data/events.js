// src/data/events.js
// Mock data de eventos focados em Brasília com dados de acessibilidade

export const EVENTS = [
  {
    id: 'e1',
    titulo: 'Rolê com LIBRAS',
    local: 'CCBB Brasília',
    localizacao_geografica: {
      latitude: -15.8113,
      longitude: -47.8735,
      descricao_espacial: 'a 2.5 km a Leste, no Setor de Clubes Esportivos Sul'
    },
    data_hora: '2026-05-20T14:00:00Z',
    horarios_acessiveis: [
      { horario: '14:00', tipo: 'Visita Guiada com LIBRAS' },
      { horario: '16:00', tipo: 'Audiodescrição' }
    ],
    tipo_de_acessibilidade: ['LIBRAS', 'Aro Magnético', 'Visita Tátil'],
    perfil_recomendado: ['auditivo', 'visual'],
    distancia_mock_km: 2.5,
    image: require('../../assets/ccbb.jpg')
  },
  {
    id: 'e2',
    titulo: 'Espetáculo Sentidos',
    local: 'Ulysses Centro de Convenções',
    localizacao_geografica: {
      latitude: -15.7865,
      longitude: -47.8967,
      descricao_espacial: 'a 800m ao Norte, no Eixo Monumental'
    },
    data_hora: '2026-05-22T19:30:00Z',
    horarios_acessiveis: [
      { horario: '19:30', tipo: 'Audiodescrição e Legendas' }
    ],
    tipo_de_acessibilidade: ['Audiodescrição', 'Legendas', 'Assentos Acessíveis'],
    perfil_recomendado: ['visual', 'auditivo'],
    distancia_mock_km: 0.8,
    image: require('../../assets/museu.jpg') // placeholder
  },
  {
    id: 'e3',
    titulo: 'Oficina Tátil de Cerâmica',
    local: 'Museu Nacional de Brasília',
    localizacao_geografica: {
      latitude: -15.7981,
      longitude: -47.8785,
      descricao_espacial: 'a 1.2 km a Leste, no Setor Cultural Sul'
    },
    data_hora: '2026-05-25T10:00:00Z',
    horarios_acessiveis: [
      { horario: '10:00', tipo: 'Instruções Táteis e Audiodescrição' },
      { horario: '14:00', tipo: 'Suporte em LIBRAS' }
    ],
    tipo_de_acessibilidade: ['Visita Tátil', 'Audiodescrição', 'LIBRAS'],
    perfil_recomendado: ['interativo', 'visual', 'auditivo'],
    distancia_mock_km: 1.2,
    image: require('../../assets/museu.jpg')
  },
  {
    id: 'e4',
    titulo: 'Concerto Inclusivo',
    local: 'Teatro Nacional de Brasília',
    localizacao_geografica: {
      latitude: -15.7941,
      longitude: -47.8778,
      descricao_espacial: 'a 1.5 km a Nordeste, no Setor Cultural Norte'
    },
    data_hora: '2026-05-28T20:00:00Z',
    horarios_acessiveis: [
      { horario: '20:00', tipo: 'Colete Vibratório e Intérprete de LIBRAS' }
    ],
    tipo_de_acessibilidade: ['Colete Vibratório', 'LIBRAS', 'Aro Magnético'],
    perfil_recomendado: ['auditivo', 'interativo'],
    distancia_mock_km: 1.5,
    image: require('../../assets/teatro.jpg')
  }
];

export function getEventById(id) {
  return EVENTS.find((e) => e.id === id);
}
