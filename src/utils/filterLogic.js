// src/utils/filterLogic.js

/**
 * Filtra e ordena eventos com base no perfil sensorial e proximidade.
 * @param {Array} eventos - Lista de eventos.
 * @param {string} filtroAtual - Filtro selecionado ('todos', 'visual', 'auditivo', 'interativo').
 * @returns {Array} Eventos filtrados e ordenados.
 */
export function explorarEventos(eventos, filtroAtual) {
  // 1. Filtrar pelo perfil sensorial
  let eventosFiltrados = eventos;
  if (filtroAtual !== 'todos') {
    eventosFiltrados = eventos.filter(evento => 
      evento.perfil_recomendado.includes(filtroAtual)
    );
  }

  // 2. Ordenar por proximidade (usando a distância mock em km)
  // Como estamos priorizando a acessibilidade, o filtro inicial já garante que
  // apenas locais adequados ao perfil sejam mostrados. A ordenação secundária é a distância.
  return eventosFiltrados.sort((a, b) => a.distancia_mock_km - b.distancia_mock_km);
}
