import axios from 'axios';

// Base URL for API - change this to match your backend host
export const BASE_URL = "https://eletro-time-production.up.railway.app/api"; // Default address to connect to localhost from Android Emulator

// eslint-disable-next-line import/no-named-as-default-member
export const apiInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

let accessToken: string | null = null;

export const setApiToken = (token: string | null) => {
  accessToken = token;
};

// Request interceptor to attach bearer token dynamically
apiInstance.interceptors.request.use(
  (config) => {
    if (accessToken && !config.url?.includes('/login')) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors uniformly
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMsg = "Erro na requisição";
    if (error.response) {
      const data = error.response.data;
      errorMsg = data && typeof data === 'object' && (data.detail || data.mensagem || data.message)
        ? data.detail || data.mensagem || data.message
        : `Erro ${error.response.status}`;
    } else if (error.request) {
      errorMsg = "Sem resposta do servidor. Verifique sua conexão de rede.";
    } else {
      errorMsg = error.message;
    }
    return Promise.reject(new Error(errorMsg));
  }
);

// Compatibility wrapper for existing codebase and standard calls
export const api = {
  get: async (endpoint: string, params?: Record<string, string>, headers?: any) => {
    const response = await apiInstance.get(endpoint, { params, headers });
    return response.data;
  },
  post: async (endpoint: string, body?: any, headers?: any) => {
    const response = await apiInstance.post(endpoint, body, { headers });
    return response.data;
  },
  put: async (endpoint: string, body?: any, headers?: any) => {
    const response = await apiInstance.put(endpoint, body, { headers });
    return response.data;
  },
  delete: async (endpoint: string, headers?: any) => {
    const response = await apiInstance.delete(endpoint, { headers });
    return response.data;
  }
};

// Fetcher helper for SWR hook
export const swrFetcher = async (url: string) => {
  const response = await apiInstance.get(url);
  return response.data;
};
