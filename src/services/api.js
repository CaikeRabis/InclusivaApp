import { Platform } from 'react-native';

// No Android Emulator, 10.0.2.2 mapeia para o localhost da máquina hospedeira.
// No iOS Simulator e na Web, localhost é usado diretamente.
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

export const API_URL = getBaseUrl();

// ── Helper Geral de Requisições ───────────────────────────────────────────────
const request = async (path, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || `Erro HTTP: ${response.status}`);
    }
    return result;
  } catch (error) {
    console.error(`Erro na requisição ${path}:`, error.message);
    throw error;
  }
};

// ── Endpoints de Locais (CRUD) ────────────────────────────────────────────────
export const localService = {
  getAll: async () => {
    const res = await request('/locais');
    return res.data;
  },
  getById: async (id) => {
    const res = await request(`/locais/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await request('/locais', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
  update: async (id, data) => {
    const res = await request(`/locais/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await request(`/locais/${id}`, {
      method: 'DELETE',
    });
    return res.message;
  },
};

// ── Endpoints de Obras (CRUD) ─────────────────────────────────────────────────
export const obraService = {
  getAll: async () => {
    const res = await request('/obras');
    return res.data;
  },
  getByNfcId: async (nfcId) => {
    const res = await request(`/obras/nfc/${nfcId}`);
    return res.data;
  },
  create: async (data) => {
    const res = await request('/obras', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
  update: async (id, data) => {
    const res = await request(`/obras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await request(`/obras/${id}`, {
      method: 'DELETE',
    });
    return res.message;
  },
};
