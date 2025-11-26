import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Pedido {
  id: number;
  descricao: string;
  endereco: string;
  valorTotal: number; // <--- CAMPO NOVO para o financeiro
  status: string;
  criadoEm: string;
}

interface PedidoState {
  lista: Pedido[];
  loading: boolean;
}

const initialState: PedidoState = {
  lista: [],
  loading: false,
};

const pedidoSlice = createSlice({
  name: 'pedidos',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPedidos: (state, action: PayloadAction<Pedido[]>) => {
      state.lista = action.payload;
      state.loading = false;
    },
    adicionarPedido: (state, action: PayloadAction<Pedido>) => {
      state.lista.push(action.payload);
    },
    atualizarStatusPedido: (state, action: PayloadAction<Pedido>) => {
      const index = state.lista.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.lista[index] = action.payload;
    },
    atualizarConteudoPedido: (state, action: PayloadAction<Pedido>) => {
      const index = state.lista.findIndex(p => p.id === action.payload.id);
      if (index !== -1) state.lista[index] = action.payload;
    },
    removerPedido: (state, action: PayloadAction<number>) => {
      state.lista = state.lista.filter(p => p.id !== action.payload);
    }
  },
});

export const { 
  setPedidos, 
  setLoading, 
  adicionarPedido, 
  atualizarStatusPedido, 
  atualizarConteudoPedido, 
  removerPedido 
} = pedidoSlice.actions;

export default pedidoSlice.reducer;