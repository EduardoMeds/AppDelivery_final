import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';

// Componente para proteger rotas privadas
// CORREÇÃO: Usamos React.ReactNode em vez de JSX.Element para evitar erros de namespace
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? (children as React.ReactElement) : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Nova Rota de Cadastro */}
        <Route path="/register" element={<Register />} />
        
        {/* Rota Protegida */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Qualquer rota desconhecida vai para Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;