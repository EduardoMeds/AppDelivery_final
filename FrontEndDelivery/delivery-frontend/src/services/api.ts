import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/authSlice';

// Aponta para o Backend Java rodando na porta 8081
const api = axios.create({
  baseURL: 'http://localhost:8081',
});

// INTERCEPTOR DE REQUISIÇÃO
// Injeta o token JWT do Redux em toda chamada automaticamente
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPOSTA
// Captura erros 401 (Token expirado/inválido) e força o logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se der 401, dispara a ação de logout no Redux
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;