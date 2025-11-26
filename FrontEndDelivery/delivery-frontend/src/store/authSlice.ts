import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  nome: string;
  tipo: 'CLIENTE' | 'EMPRESA';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// FUNÇÃO SEGURA PARA LER O STORAGE
// Se tiver lixo ou erro, retorna null em vez de quebrar a tela
const getUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'undefined') return null;
    return JSON.parse(storedUser);
  } catch (error) {
    console.warn("Erro ao ler usuário do localStorage, limpando dados...", error);
    localStorage.removeItem('user'); // Limpa o dado corrompido
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
