// Shared place data – used by HomeScreen, NFCScreen, and others.
// Images are resolved here so we don't need to pass non-serialisable
// `require()` results through navigation params.

export const PLACES = [
  {
    id: '1',
    name: 'CCBB',
    fullName: 'Centro Cultural Banco do Brasil',
    duration: '45 Minutos',
    isFree: true,
    rating: '4.8',
    image: require('../../assets/ccbb.jpg'),
    accessibility: true,
    accessibilityType: 'Visual',
    category: 'visual',
  },
  {
    id: '2',
    name: 'Museu Nacional',
    fullName: 'Museu Nacional de Brasília',
    duration: '1h 30min',
    isFree: true,
    rating: '4.6',
    image: require('../../assets/museu.jpg'),
    accessibility: true,
    accessibilityType: 'Auditivo',
    category: 'auditivo',
  },
  {
    id: '3',
    name: 'Teatro Nacional',
    fullName: 'Teatro Nacional de Brasília',
    duration: '2 Horas',
    isFree: false,
    price: '30,00',
    rating: '4.5',
    image: require('../../assets/teatro.jpg'),
    accessibility: true,
    accessibilityType: 'Interativo',
    category: 'interativo',
  },
];

// NEARBY constant was replaced by TrailTimeline


// Helper to find a place by id (useful after navigation)
export function getPlaceById(id) {
  return PLACES.find((p) => p.id === id);
}
