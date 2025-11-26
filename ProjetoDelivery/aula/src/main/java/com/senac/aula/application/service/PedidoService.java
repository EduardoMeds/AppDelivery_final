package com.senac.aula.application.service;

import com.senac.aula.application.dto.pedido.PedidoRequest;
import com.senac.aula.application.dto.pedido.PedidoResponse;
import com.senac.aula.domain.EmailSenderPort;
import com.senac.aula.domain.enums.StatusPedido;
import com.senac.aula.domain.enums.TipoUsuario;
import com.senac.aula.domain.model.PedidoDelivery;
import com.senac.aula.domain.model.Usuario;
import com.senac.aula.exception.BusinessException;
import com.senac.aula.infra.repository.PedidoRepository;
import com.senac.aula.infra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailSenderPort emailSenderPort;

    // Pega usuário logado independente do tipo
    private Usuario getUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));
    }

    private PedidoResponse toPedidoResponse(PedidoDelivery pedido) {
        return new PedidoResponse(
                pedido.getId(),
                pedido.getDescricao(),
                pedido.getEndereco(),
                pedido.getValorTotal(),
                pedido.getStatus().name(),
                pedido.getCriadoEm()
        );
    }

    // LÓGICA MISTA (Serve tanto para Empresa quanto para Cliente)
    @Transactional
    public PedidoResponse criarPedido(PedidoRequest req) {
        Usuario usuarioLogado = getUsuarioLogado();
        Usuario empresaDoPedido;
        Usuario clienteDoPedido;

        if (usuarioLogado.getTipo() == TipoUsuario.EMPRESA) {
            // Cenário 1: A própria empresa criando pedido (PDV)
            empresaDoPedido = usuarioLogado;
            clienteDoPedido = null; // Balcão/Telefone (sem cadastro)
        } else {
            // Cenário 2: Cliente criando pedido pelo App
            if (req.empresaId() == null) {
                throw new BusinessException("Selecione um restaurante para fazer o pedido.");
            }
            empresaDoPedido = usuarioRepository.findById(req.empresaId())
                    .orElseThrow(() -> new BusinessException("Restaurante não encontrado."));
            clienteDoPedido = usuarioLogado;
        }

        PedidoDelivery novoPedido = PedidoDelivery.builder()
                .descricao(req.descricao())
                .endereco(req.endereco())
                .valorTotal(req.valorTotal())
                .empresa(empresaDoPedido)
                .cliente(clienteDoPedido)
                .build();

        PedidoDelivery pedidoSalvo = pedidoRepository.save(novoPedido);

        try {
            // Envia email para quem fez o pedido (se for cliente cadastrado)
            String emailDestino = (clienteDoPedido != null) ? clienteDoPedido.getEmail() : empresaDoPedido.getEmail();
            emailSenderPort.sendOrderConfirmationEmail(
                    emailDestino,
                    novoPedido.getDescricao(),
                    (clienteDoPedido != null) ? clienteDoPedido.getNome() : "Cliente Balcão"
            );
        } catch (Exception e) {
            System.err.println("Erro email: " + e.getMessage());
        }

        return toPedidoResponse(pedidoSalvo);
    }

    // Lista pedidos baseado em QUEM está chamando
    public List<PedidoResponse> listarPedidos() {
        Usuario usuarioLogado = getUsuarioLogado();
        List<PedidoDelivery> pedidos;

        if (usuarioLogado.getTipo() == TipoUsuario.EMPRESA) {
            pedidos = pedidoRepository.findByEmpresa(usuarioLogado);
        } else {
            pedidos = pedidoRepository.findByCliente(usuarioLogado);
        }

        return pedidos.stream().map(this::toPedidoResponse).collect(Collectors.toList());
    }

    // --- Métodos de Manipulação (Apenas Empresa) ---

    @Transactional
    public PedidoResponse avancarStatus(Long id) {
        Usuario usuarioLogado = getUsuarioLogado();
        // Apenas empresa pode avançar status
        if (usuarioLogado.getTipo() != TipoUsuario.EMPRESA) {
            throw new BusinessException("Apenas empresas podem alterar status.");
        }

        PedidoDelivery pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Pedido não encontrado"));

        if (!pedido.getEmpresa().getId().equals(usuarioLogado.getId())) {
            throw new BusinessException("Acesso negado.");
        }

        StatusPedido statusAtual = pedido.getStatus();
        // Lógica simples de avanço
        if (statusAtual != StatusPedido.ENTREGUE) {
            pedido.setStatus(StatusPedido.values()[statusAtual.ordinal() + 1]);
        }

        return toPedidoResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public void excluirPedido(Long id) {
        Usuario usuarioLogado = getUsuarioLogado();
        PedidoDelivery pedido = pedidoRepository.findById(id).orElseThrow();

        // Validação de segurança: Dono da empresa OU Dono do pedido (Cliente)
        boolean isDonoEmpresa = pedido.getEmpresa().getId().equals(usuarioLogado.getId());
        boolean isDonoCliente = pedido.getCliente() != null && pedido.getCliente().getId().equals(usuarioLogado.getId());

        if (!isDonoEmpresa && !isDonoCliente) {
            throw new BusinessException("Sem permissão para excluir.");
        }
        pedidoRepository.delete(pedido);
    }

    public PedidoResponse atualizarPedido(Long id, PedidoRequest req) {
        // Implementação simplificada para manter compatibilidade
        PedidoDelivery pedido = pedidoRepository.findById(id).orElseThrow();
        pedido.setDescricao(req.descricao());
        return toPedidoResponse(pedidoRepository.save(pedido));
    }
}