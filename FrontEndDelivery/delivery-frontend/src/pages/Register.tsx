import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [documento, setDocumento] = useState(''); // Serve para CPF ou CNPJ
  const [isEmpresa, setIsEmpresa] = useState(true); // Default para Empresa (já que é o foco do dashboard)
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Monta o objeto conforme o backend espera
      // Se for empresa, manda 'cnpj', se for cliente, manda 'cpf'
      const payload = {
        nome,
        email,
        senha,
        [isEmpresa ? 'cnpj' : 'cpf']: documento
      };

      await api.post('/auth/register', payload);
      
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
      
    } catch (err: any) {
      console.error(err);
      // Tenta pegar a mensagem de erro do backend ou usa uma genérica
      const msg = err.response?.data?.error || 'Erro ao realizar cadastro. Verifique os dados.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #556270 100%)',
        padding: '20px'
      }}
    >
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
          <h4 className="fw-bold text-dark mb-1">Crie sua Conta</h4>
          <p className="text-muted small">Preencha os dados para começar</p>
        </div>

        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger py-2 mb-3 text-center" role="alert">
              <small>{error}</small>
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Toggle Tipo de Conta */}
            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group w-100" role="group">
                <input 
                  type="radio" 
                  className="btn-check" 
                  name="btnradio" 
                  id="btnradio1" 
                  autoComplete="off" 
                  checked={!isEmpresa}
                  onChange={() => { setIsEmpresa(false); setDocumento(''); }}
                />
                <label className="btn btn-outline-secondary" htmlFor="btnradio1">Cliente</label>

                <input 
                  type="radio" 
                  className="btn-check" 
                  name="btnradio" 
                  id="btnradio2" 
                  autoComplete="off" 
                  checked={isEmpresa}
                  onChange={() => { setIsEmpresa(true); setDocumento(''); }}
                />
                <label className="btn btn-outline-danger" htmlFor="btnradio2">Empresa (Restaurante)</label>
              </div>
            </div>

            <div className="form-floating mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <label className="text-secondary">Nome {isEmpresa ? 'do Restaurante' : 'Completo'}</label>
            </div>

            <div className="form-floating mb-3">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="text-secondary">E-mail</label>
            </div>

            <div className="form-floating mb-3">
              <input 
                type="text" 
                className="form-control" 
                placeholder={isEmpresa ? "CNPJ" : "CPF"}
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                // Máscara simples manual (opcional)
                required
              />
              <label className="text-secondary">{isEmpresa ? 'CNPJ' : 'CPF'}</label>
            </div>
            
            <div className="form-floating mb-4">
              <input 
                type="password" 
                className="form-control" 
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
              />
              <label className="text-secondary">Senha (mín. 6 caracteres)</label>
            </div>

            <button 
              type="submit" 
              className="btn btn-danger btn-lg w-100 fw-semibold shadow-sm mb-3"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <div className="text-center border-top pt-3">
            <small className="text-muted">
              Já tem uma conta? <Link to="/login" className="text-decoration-none text-danger fw-bold">Fazer Login</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}