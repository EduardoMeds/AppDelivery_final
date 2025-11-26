import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Pequeno delay visual
      await new Promise(r => setTimeout(r, 800)); 

      const response = await api.post('/auth/login', { email, senha });
      
      const { token, nome, tipo } = response.data;
      
      dispatch(setCredentials({ 
        user: { nome, tipo }, 
        token 
      }));

      navigate('/dashboard');
    } catch (err) {
      setError('Acesso negado. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
        backgroundSize: 'cover'
      }}
    >
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '400px', width: '90%' }}>
        {/* Cabeçalho */}
        <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
          <div 
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger text-white mb-3 shadow-sm"
            style={{ width: '64px', height: '64px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
            </svg>
          </div>
          <h4 className="fw-bold text-dark">Delivery App</h4>
          <p className="text-muted small">Entre para gerenciar seus pedidos</p>
        </div>

        <div className="card-body p-4 pt-2">
          {error && (
            <div className="alert alert-danger d-flex align-items-center py-2" role="alert">
              <small>{error}</small>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="form-floating mb-3">
              <input 
                type="email" 
                className="form-control" 
                id="floatingInput" 
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="floatingInput" className="text-secondary">E-mail</label>
            </div>
            
            <div className="form-floating mb-4">
              <input 
                type="password" 
                className="form-control" 
                id="floatingPassword" 
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <label htmlFor="floatingPassword" className="text-secondary">Senha</label>
            </div>

            <button 
              type="submit" 
              className="btn btn-danger btn-lg w-100 fw-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Entrando...
                </>
              ) : (
                'Acessar Sistema'
              )}
            </button>
          </form>
        </div>
        
        {/* RODAPÉ COM O LINK DE CADASTRO QUE FALTAVA */}
        <div className="card-footer bg-light text-center py-3 border-0">
          <small className="text-muted">
            Não tem uma conta? <Link to="/register" className="text-decoration-none text-danger fw-bold">Cadastre-se</Link>
          </small>
        </div>
      </div>
    </div>
  );
}