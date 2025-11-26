import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import pedidoReducer from './pedidoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pedidos: pedidoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
