import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { 
  setPedidos, 
  adicionarPedido, 
  atualizarStatusPedido, 
  atualizarConteudoPedido,
  removerPedido,
  setLoading 
} from '../store/pedidoSlice';

// --- TIPOS ---
interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  empresa?: { id: number, nome: string };
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacao: string;
}

export default function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { lista: pedidos, loading } = useSelector((state: RootState) => state.pedidos);
  const dispatch = useDispatch();

  // --- ESTADOS ---
  const [view, setView] = useState<'DASHBOARD' | 'CARDAPIO' | 'CONFIG' | 'HOME' | 'ORDERS'>('DASHBOARD');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  // Estados do PDV/Carrinho
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [itemEmEdicao, setItemEmEdicao] = useState({ produtoId: '', quantidade: 1, observacao: '' });
  const [dadosCliente, setDadosCliente] = useState({ nome: '', endereco: '', pagamento: 'Pix' });
  const [enderecoEntrega, setEnderecoEntrega] = useState(''); // Para o Cliente
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Gestão (Empresa)
  const [novoProduto, setNovoProduto] = useState({ nome: '', preco: '', categoria: 'Lanches' });
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [buscaTexto, setBuscaTexto] = useState('');

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    // Define a view inicial baseada no tipo de usuário
    if (user?.tipo === 'CLIENTE') {
      setView('HOME');
    } else {
      setView('DASHBOARD');
    }
    fetchDados();
  }, [user]);

  const fetchDados = async () => {
    dispatch(setLoading(true));
    try {
      // Busca Pedidos (Funciona para ambos: Empresa vê vendas, Cliente vê compras)
      const resPedidos = await api.get('/pedidos');
      dispatch(setPedidos(resPedidos.data));

      // Busca Produtos
      // Se for empresa, busca os seus (/empresa/produtos)
      // Se for cliente, idealmente buscaria de /public/produtos (mas vamos usar o mesmo endpoint por enquanto)
      try {
        const url = user?.tipo === 'EMPRESA' ? '/empresa/produtos' : '/empresa/produtos'; 
        const resProdutos = await api.get(url);
        setProdutos(resProdutos.data);
      } catch (e) { console.log("Erro ao buscar produtos"); }

    } catch (error) {
      console.error(error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // --- FUNÇÕES DE AÇÃO (COMUNS) ---
  
  const adicionarAoCarrinho = () => {
    const prodId = Number(itemEmEdicao.produtoId);
    const prod = produtos.find(p => p.id === prodId);
    
    // Se o cliente clicou no botão "+" direto no card (onde não tem itemEmEdicao.produtoId setado no select)
    // precisamos tratar isso na chamada do botão
    
    if (prod) {
      setCarrinho([...carrinho, { 
        produto: prod, 
        quantidade: Number(itemEmEdicao.quantidade), 
        observacao: itemEmEdicao.observacao 
      }]);
      setItemEmEdicao({ produtoId: '', quantidade: 1, observacao: '' });
    }
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho(carrinho.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
  };

  const finalizarPedido = async () => {
    if (carrinho.length === 0) return alert("Carrinho vazio.");
    
    // Validação específica para Cliente
    if (user?.tipo === 'CLIENTE' && !enderecoEntrega) return alert("Informe seu endereço.");
    // Validação específica para Empresa (PDV)
    if (user?.tipo === 'EMPRESA' && !dadosCliente.nome) return alert("Informe o nome do cliente.");

    setIsSubmitting(true);
    const total = calcularTotal();
    const resumoItens = carrinho.map(i => `${i.quantidade}x ${i.produto.nome} ${i.observacao ? `(${i.observacao})` : ''}`).join(', ');
    
    let descricaoFinal = '';
    let enderecoFinal = '';
    let nomeCliente = '';

    if (user?.tipo === 'EMPRESA') {
      nomeCliente = dadosCliente.nome;
      enderecoFinal = dadosCliente.endereco;
      descricaoFinal = `[${dadosCliente.pagamento}] ${resumoItens} | Cli: ${nomeCliente}`;
    } else {
      nomeCliente = user?.nome || 'Cliente App';
      enderecoFinal = enderecoEntrega;
      descricaoFinal = `[APP] ${resumoItens} | Total: R$ ${total.toFixed(2)}`;
    }

    // Pega o ID da empresa do primeiro produto (assumindo compra única) ou default 1
    const empresaIdAlvo = carrinho[0]?.produto?.empresa?.id || 1;

    try {
      const res = await api.post('/pedidos', {
        descricao: descricaoFinal,
        endereco: enderecoFinal,
        valorTotal: total,
        empresaId: empresaIdAlvo
      });
      
      dispatch(adicionarPedido(res.data));
      setCarrinho([]);
      setDadosCliente({ nome: '', endereco: '', pagamento: 'Pix' });
      setEnderecoEntrega('');
      alert("Pedido enviado com sucesso!");
      
      if (user?.tipo === 'CLIENTE') setView('ORDERS');
      else setView('DASHBOARD');

    } catch (e) {
      alert("Erro ao processar pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FUNÇÕES ESPECÍFICAS DA EMPRESA ---

  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        nome: novoProduto.nome,
        preco: parseFloat(novoProduto.preco.replace(',', '.')),
        categoria: novoProduto.categoria
      };
      const res = await api.post('/empresa/produtos', payload);
      setProdutos([...produtos, res.data]);
      setNovoProduto({ nome: '', preco: '', categoria: 'Lanches' });
      alert("Produto cadastrado!");
    } catch (e) { alert("Erro ao salvar."); }
  };

  const handleRemoveProduto = async (id: number) => {
    if (confirm("Excluir produto?")) {
      await api.delete(`/empresa/produtos/${id}`);
      setProdutos(produtos.filter(p => p.id !== id));
    }
  };

  const handleAdvanceStatus = async (id: number) => {
    const res = await api.put(`/empresa/pedidos/${id}/avancar`);
    dispatch(atualizarStatusPedido(res.data));
  };

  const handleDeleteOrder = async (id: number) => {
    if (confirm("Excluir pedido?")) {
      await api.delete(`/empresa/pedidos/${id}`);
      dispatch(removerPedido(id));
    }
  };

  // --- RENDERIZAÇÃO ---

  const faturamentoTotal = pedidos
    .filter(p => p.status !== 'CANCELADO')
    .reduce((acc, p) => acc + (p.valorTotal || 0), 0);

  const pedidosFiltrados = pedidos
    .filter(p => {
      if (filtroStatus !== 'TODOS' && p.status !== filtroStatus) return false;
      if (buscaTexto && !p.descricao.toLowerCase().includes(buscaTexto.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.id - a.id);

  const getStatusBadge = (status: string) => {
    const map: any = { 'RECEBIDO': 'bg-secondary', 'EM_PREPARO': 'bg-warning text-dark', 'A_CAMINHO': 'bg-primary', 'ENTREGUE': 'bg-success' };
    return map[status] || 'bg-light text-dark';
  };

  // ==============================================================
  // VISÃO DO CLIENTE (CARLOS)
  // ==============================================================
  if (user?.tipo === 'CLIENTE') {
    return (
      <div className="min-vh-100 bg-light font-sans">
        <nav className="navbar navbar-expand-lg navbar-dark bg-danger px-4 shadow-sm sticky-top">
          <div className="container">
            <span className="navbar-brand fw-bold d-flex align-items-center">
              🍕 Delivery App <span className="badge bg-white text-danger ms-2 fs-6 rounded-pill">Olá, {user.nome}</span>
            </span>
            <div className="d-flex gap-2">
              <button className={`btn btn-sm fw-bold ${view === 'HOME' ? 'btn-light text-danger' : 'btn-outline-light'}`} onClick={()=>setView('HOME')}>Cardápio</button>
              <button className={`btn btn-sm fw-bold ${view === 'ORDERS' ? 'btn-light text-danger' : 'btn-outline-light'}`} onClick={()=>setView('ORDERS')}>Meus Pedidos</button>
              <button className="btn btn-sm btn-dark ms-3" onClick={() => dispatch(logout())}>Sair</button>
            </div>
          </div>
        </nav>

        <div className="container py-4">
          {view === 'HOME' && (
            <div className="row g-4">
              {/* Coluna Produtos */}
              <div className="col-md-8">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold text-dark mb-0">🍔 O que vamos pedir hoje?</h4>
                </div>
                
                <div className="row g-3">
                  {produtos.length === 0 && <div className="alert alert-warning">Nenhum restaurante cadastrou produtos ainda.</div>}
                  {produtos.map(p => (
                    <div key={p.id} className="col-md-6">
                      <div className="card border-0 shadow-sm h-100 hover-shadow transition">
                        <div className="card-body d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="fw-bold mb-1 text-dark">{p.nome}</h5>
                            <span className="badge bg-light text-secondary border mb-2">{p.categoria || 'Geral'}</span>
                            <h5 className="text-success fw-bold m-0">R$ {p.preco.toFixed(2)}</h5>
                          </div>
                          <button 
                            className="btn btn-outline-danger rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                            style={{width:45, height:45}}
                            onClick={() => setCarrinho([...carrinho, { produto: p, quantidade: 1, observacao: '' }])}
                          >
                            <span className="fs-4 mb-1">+</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna Carrinho */}
              <div className="col-md-4">
                <div className="card border-0 shadow rounded-4 sticky-top" style={{top: '80px'}}>
                  <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                    <h5 className="fw-bold text-danger">🛒 Sua Sacola</h5>
                  </div>
                  <div className="card-body px-4 pb-4">
                    {carrinho.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <div className="fs-1 opacity-25">🛍️</div>
                        <p>Sua sacola está vazia.</p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3" style={{maxHeight: '300px', overflowY: 'auto'}}>
                          {carrinho.map((item, idx) => (
                            <div key={idx} className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                              <div>
                                <div className="fw-bold text-dark">{item.quantidade}x {item.produto.nome}</div>
                                <small className="text-muted">R$ {item.produto.preco.toFixed(2)} cada</small>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</div>
                                <small className="text-danger cursor-pointer" onClick={() => removerDoCarrinho(idx)} style={{cursor:'pointer'}}>remover</small>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="bg-light p-3 rounded-3 mb-3">
                          <div className="d-flex justify-content-between fw-bold fs-5">
                            <span>Total:</span>
                            <span className="text-success">R$ {carrinho.reduce((acc, i) => acc + (i.produto.preco * i.quantidade), 0).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-bold text-muted">Onde entregar?</label>
                          <input 
                            className="form-control" 
                            placeholder="Rua, Número, Bairro..." 
                            value={enderecoEntrega} 
                            onChange={e => setEnderecoEntrega(e.target.value)} 
                          />
                        </div>

                        <button 
                          className="btn btn-danger w-100 py-2 fw-bold shadow-sm" 
                          onClick={finalizarPedido}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'ORDERS' && (
            <div className="row justify-content-center">
              <div className="col-md-10">
                <h4 className="mb-4 fw-bold text-dark">📦 Meus Pedidos Recentes</h4>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="ps-4 py-3">#</th>
                          <th>Descrição</th>
                          <th>Data</th>
                          <th>Valor</th>
                          <th className="text-center">Status Atual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidos.map(p => (
                          <tr key={p.id}>
                            <td className="ps-4 fw-bold text-muted">#{p.id}</td>
                            <td>
                              <div className="fw-semibold text-dark">{p.descricao}</div>
                              <small className="text-muted">{p.endereco}</small>
                            </td>
                            <td className="text-muted small">
                              {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="fw-bold text-dark">
                              R$ {p.valorTotal?.toFixed(2) || '0.00'}
                            </td>
                            <td className="text-center">
                              <span className={`badge rounded-pill px-3 py-2 ${p.status === 'ENTREGUE' ? 'bg-success' : 'bg-primary'}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {pedidos.length === 0 && (
                          <tr><td colSpan={5} className="text-center py-5 text-muted">Você ainda não fez nenhum pedido.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==============================================================
  // VISÃO DA EMPRESA (ADMIN)
  // ==============================================================
  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      
      {/* SIDEBAR */}
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{width: '260px'}}>
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-5 fw-bold ms-2">🚀 Delivery Pro</span>
        </a>
        <hr className="border-secondary"/>
        <div className="mb-4 px-2">
          <small className="text-secondary text-uppercase" style={{fontSize: '0.7rem'}}>Empresa Logada</small>
          <div className="fw-bold text-truncate">{user?.nome}</div>
        </div>
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          <li><button className={`nav-link w-100 text-start text-white ${view === 'DASHBOARD' ? 'bg-danger' : ''}`} onClick={() => setView('DASHBOARD')}>📊 Painel de Vendas</button></li>
          <li><button className={`nav-link w-100 text-start text-white ${view === 'CARDAPIO' ? 'bg-danger' : ''}`} onClick={() => setView('CARDAPIO')}>🍔 Produtos & PDV</button></li>
          <li><button className={`nav-link w-100 text-start text-white ${view === 'CONFIG' ? 'bg-danger' : ''}`} onClick={() => setView('CONFIG')}>⚙️ Ajustes</button></li>
        </ul>
        <div className="mt-auto">
          <button className="btn btn-outline-secondary w-100 btn-sm" onClick={() => dispatch(logout())}>Sair do Sistema</button>
        </div>
      </div>

      {/* MAIN CONTENT EMPRESA */}
      <div className="flex-grow-1 p-4 overflow-auto" style={{ maxHeight: '100vh' }}>
        
        {view === 'DASHBOARD' && (
          <>
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <h2 className="fw-bold text-dark mb-0">Visão Geral</h2>
                <p className="text-muted">Acompanhe o desempenho do seu delivery hoje.</p>
              </div>
              <button className="btn btn-success px-4 py-2 fw-bold shadow-sm" onClick={() => setView('CARDAPIO')}>+ Novo Pedido</button>
            </div>

            {/* CARDS DE MÉTRICAS */}
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 h-100 border-start border-4 border-primary">
                  <small className="text-muted fw-bold text-uppercase">Pedidos Hoje</small>
                  <h3 className="fw-bold mb-0 mt-1">{pedidos.length}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 h-100 border-start border-4 border-warning">
                  <small className="text-muted fw-bold text-uppercase">Em Produção</small>
                  <h3 className="fw-bold mb-0 mt-1">{pedidos.filter(p => p.status !== 'ENTREGUE').length}</h3>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm p-3 h-100 border-start border-4 border-success">
                  <small className="text-muted fw-bold text-uppercase">Faturamento</small>
                  <h3 className="fw-bold mb-0 mt-1 text-success">
                    {faturamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </h3>
                </div>
              </div>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="card border-0 shadow-sm rounded-3 mb-3">
              <div className="card-body p-2 d-flex gap-2">
                <input type="text" className="form-control border-0 bg-light" placeholder="🔍 Buscar por cliente ou endereço..." value={buscaTexto} onChange={e => setBuscaTexto(e.target.value)} />
                <select className="form-select w-auto border-0 bg-light fw-bold text-secondary" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                  <option value="TODOS">Status: Todos</option>
                  <option value="RECEBIDO">Recebidos</option>
                  <option value="EM_PREPARO">Em Preparo</option>
                  <option value="A_CAMINHO">Em Entrega</option>
                  <option value="ENTREGUE">Finalizados</option>
                </select>
              </div>
            </div>

            {/* TABELA */}
            <div className="card border-0 shadow-sm rounded-3">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light text-secondary text-uppercase small">
                    <tr>
                      <th className="ps-4 py-3">#ID</th>
                      <th>Detalhes do Pedido</th>
                      <th>Valor</th>
                      <th className="text-center">Status</th>
                      <th className="text-end pe-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map(pedido => (
                      <tr key={pedido.id}>
                        <td className="ps-4 fw-bold text-muted">#{pedido.id}</td>
                        <td style={{ maxWidth: '350px'}}>
                          <div className="fw-semibold text-dark text-truncate">{pedido.descricao}</div>
                          <div className="small text-muted"><i className="bi bi-geo-alt me-1"></i>{pedido.endereco}</div>
                        </td>
                        <td className="fw-bold text-dark">
                          {pedido.valorTotal 
                            ? pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                            : '-'}
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill ${getStatusBadge(pedido.status)} px-3 py-2 fw-normal`}>
                            {pedido.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                           {pedido.status !== 'ENTREGUE' && (
                             <button className="btn btn-sm btn-primary me-1" onClick={() => handleAdvanceStatus(pedido.id)}>Avançar</button>
                           )}
                           <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteOrder(pedido.id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {view === 'CARDAPIO' && (
          <div className="row g-4">
            {/* CADASTRO DE PRODUTOS */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-white pt-4 px-4 border-0">
                  <h5 className="fw-bold">🍔 Cardápio Digital</h5>
                  <p className="text-muted small">Gerencie os itens disponíveis.</p>
                </div>
                <div className="card-body px-4">
                  <form onSubmit={handleAddProduto} className="mb-4">
                    <div className="mb-2">
                      <input type="text" className="form-control" placeholder="Nome (ex: X-Bacon)" value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} />
                    </div>
                    <div className="row g-2 mb-2">
                      <div className="col-6">
                        <input type="text" className="form-control" placeholder="Preço (0,00)" value={novoProduto.preco} onChange={e => setNovoProduto({...novoProduto, preco: e.target.value})} />
                      </div>
                      <div className="col-6">
                        <select className="form-select text-secondary" value={novoProduto.categoria} onChange={e => setNovoProduto({...novoProduto, categoria: e.target.value})}>
                          <option>Lanches</option><option>Bebidas</option><option>Pizzas</option><option>Sobremesas</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-dark w-100 fw-bold">Salvar Produto</button>
                  </form>
                  
                  <div className="list-group list-group-flush border-top pt-2">
                    {produtos.map(p => (
                      <div key={p.id} className="list-group-item px-0 d-flex justify-content-between align-items-center border-bottom-0">
                        <div>
                          <div className="fw-bold text-dark">{p.nome}</div>
                          <small className="text-muted">{p.categoria}</small>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bold text-success">R$ {p.preco.toFixed(2)}</span>
                          <button className="btn btn-sm btn-light text-danger" onClick={() => handleRemoveProduto(p.id)}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* PDV (PONTO DE VENDA) */}
            <div className="col-md-8">
              <div className="card border-0 shadow rounded-4 h-100 border-top border-4 border-danger">
                <div className="card-header bg-white pt-4 px-4 border-0 d-flex justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-0">🖥️ PDV - Novo Pedido</h5>
                    <p className="text-muted small">Lance pedidos balcão ou delivery.</p>
                  </div>
                  <div className="bg-light px-3 py-1 rounded-pill fw-bold text-secondary">
                    {carrinho.length} itens
                  </div>
                </div>
                <div className="card-body px-4">
                  
                  <div className="row g-2 mb-4 bg-light p-3 rounded-3">
                    <div className="col-md-5">
                      <label className="small fw-bold text-muted">Produto</label>
                      <select className="form-select border-0 shadow-sm" value={itemEmEdicao.produtoId} onChange={e => setItemEmEdicao({...itemEmEdicao, produtoId: e.target.value})}>
                        <option value="">Selecione o item...</option>
                        {produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco.toFixed(2)}</option>)}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="small fw-bold text-muted">Qtd</label>
                      <input type="number" className="form-control border-0 shadow-sm" value={itemEmEdicao.quantidade} onChange={e => setItemEmEdicao({...itemEmEdicao, quantidade: Number(e.target.value)})} min="1" />
                    </div>
                    <div className="col-md-3">
                      <label className="small fw-bold text-muted">Observação</label>
                      <input type="text" className="form-control border-0 shadow-sm" placeholder="Opcional" value={itemEmEdicao.observacao} onChange={e => setItemEmEdicao({...itemEmEdicao, observacao: e.target.value})} />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                       <button className="btn btn-success w-100 fw-bold shadow-sm" onClick={adicionarAoCarrinho}>ADD +</button>
                    </div>
                  </div>

                  <div className="table-responsive mb-4" style={{ minHeight: '150px' }}>
                    <table className="table align-middle">
                      <thead className="text-secondary small"><tr><th>Item</th><th>Obs</th><th className="text-end">Subtotal</th><th></th></tr></thead>
                      <tbody>
                        {carrinho.map((item, idx) => (
                          <tr key={idx}>
                            <td><span className="fw-bold">{item.quantidade}x</span> {item.produto.nome}</td>
                            <td className="text-muted small"><em>{item.observacao || '-'}</em></td>
                            <td className="text-end fw-bold">R$ {(item.produto.preco * item.quantidade).toFixed(2)}</td>
                            <td className="text-end"><button className="btn btn-sm text-danger" onClick={() => removerDoCarrinho(idx)}>🗑️</button></td>
                          </tr>
                        ))}
                        {carrinho.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">Nenhum item adicionado.</td></tr>}
                      </tbody>
                    </table>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="fw-bold text-uppercase text-muted small mb-3">Dados do Cliente</h6>
                      <input type="text" className="form-control mb-2" placeholder="Nome do Cliente" value={dadosCliente.nome} onChange={e => setDadosCliente({...dadosCliente, nome: e.target.value})} />
                      <input type="text" className="form-control mb-2" placeholder="Endereço Completo" value={dadosCliente.endereco} onChange={e => setDadosCliente({...dadosCliente, endereco: e.target.value})} />
                      <select className="form-select" value={dadosCliente.pagamento} onChange={e => setDadosCliente({...dadosCliente, pagamento: e.target.value})}>
                        <option value="Pix">Pix</option><option value="Cartão">Cartão</option><option value="Dinheiro">Dinheiro</option>
                      </select>
                    </div>
                    <div className="col-md-6 d-flex flex-column justify-content-end align-items-end">
                      <div className="text-end mb-3">
                        <small className="text-muted text-uppercase fw-bold">Total a Pagar</small>
                        <h1 className="fw-bold text-dark m-0" style={{fontSize: '2.5rem'}}>
                          {calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h1>
                      </div>
                      <button className="btn btn-danger btn-lg w-100 fw-bold shadow" disabled={isSubmitting} onClick={finalizarPedido}>
                        {isSubmitting ? 'ENVIANDO...' : '✅ CONCLUIR PEDIDO'}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'CONFIG' && (
           <div className="text-center py-5 mt-5">
              <div className="display-1 text-muted opacity-25 mb-3">⚙️</div>
              <h3>Configurações da Loja</h3>
              <p className="text-muted">Funcionalidade futura para alterar logotipo e horários.</p>
           </div>
        )}

      </div>
    </div>
  );
}