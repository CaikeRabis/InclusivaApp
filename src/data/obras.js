export const OBRAS_MOCK = {
  "1": {
    titulo: "A Dança das Formas",
    resumo: "Uma escultura tátil que explora o movimento geométrico. A obra possui curvas suaves em aço inoxidável, permitindo que a luz crie padrões dinâmicos. Ao tocá-la, sente-se a transição da textura lisa para a áspera na base.",
    autor: "Marina Silva"
  },
  "2": {
    titulo: "O Som da Cidade",
    resumo: "Instalação sonora interativa. Sons cotidianos de Brasília são mixados em uma sinfonia contínua. Elementos de percussão acompanham o ritmo do trânsito do Eixão.",
    autor: "Coletivo Ruidoso"
  },
  "3": {
    titulo: "Raízes do Cerrado",
    resumo: "Pintura em alto relevo utilizando pigmentos naturais da terra. Retrata a resistência das árvores do cerrado com troncos tortuosos, onde cada ranhura pode ser acompanhada pelo toque dos dedos.",
    autor: "Carlos Mendes"
  },
  "4": {
    titulo: "Janelas da Alma",
    resumo: "Série de retratos fotográficos convertidos em matrizes 3D. A obra convida a perceber as expressões faciais através da textura das testas franzidas e sorrisos largos.",
    autor: "Helena Ramos"
  },
  "5": {
    titulo: "Ventos de Agosto",
    resumo: "Escultura móvel suspensa (móbile). Peças de madeira leve balançam suavemente, reproduzindo o som sutil do vento cruzando a arquitetura modernista.",
    autor: "Lucas Neves"
  },
  "6": {
    titulo: "Cores Ocultas",
    resumo: "Painel sensorial. Cores quentes são representadas por texturas felpudas que emanam um leve calor, enquanto cores frias são feitas de metais lisos e refrescantes.",
    autor: "Amanda Luz"
  },
  "7": {
    titulo: "Ecos do Passado",
    resumo: "Obra focada na audiodescrição imersiva. Conta a história da construção da capital através de fragmentos de áudio de trabalhadores da época.",
    autor: "Instituto Memória"
  },
  "8": {
    titulo: "O Abraço",
    resumo: "Escultura de grandes dimensões em bronze com formato curvo e acolhedor. Convida o público a entrar em seu interior para experimentar uma mudança na acústica do ambiente.",
    autor: "Thiago Ferraz"
  },
  "9": {
    titulo: "Linhas do Horizonte",
    resumo: "Trabalho em braille expandido. Poemas sobre a vastidão do céu de Brasília gravados em grandes placas de acrílico iluminadas nas bordas.",
    autor: "Beatriz Nogueira"
  },
  "10": {
    titulo: "Coração de Concreto",
    resumo: "Maquete tátil de um dos palácios da cidade. Permite a compreensão espacial da arquitetura moderna, com texturas diferenciadas para vidro, água e concreto.",
    autor: "Escola de Arquitetura"
  }
};

export const getObraById = (id) => {
  return OBRAS_MOCK[id] || null;
};
