import axios from 'axios';
import Cookies from 'js-cookie';
import { setAuthToken, removeAuthToken, getRefreshToken } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://89.117.51.103:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Response Interceptor ────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

// Processa a fila de requisições que falharam enquanto o token estava sendo renovado
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Só trata erros 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Evita loop infinito se o próprio refresh falhar
    if (originalRequest._retry) {
      removeAuthToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    // Sem refresh token → logout imediato
    if (!refreshToken) {
      removeAuthToken();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Se já está renovando, enfileira a requisição
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch((err) => Promise.reject(err));
    }

    // Inicia o processo de refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const newToken = data.access_token;
      const newRefreshToken = data.refresh_token;

      // Salva os novos tokens
      setAuthToken(newToken, newRefreshToken);

      // Atualiza o header da requisição original
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      // Libera a fila com o novo token
      processQueue(null, newToken);

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh falhou → logout
      processQueue(refreshError, null);
      removeAuthToken();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;