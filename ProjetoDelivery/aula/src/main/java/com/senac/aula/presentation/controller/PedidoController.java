package com.senac.aula.presentation.controller;

import com.senac.aula.application.dto.pedido.PedidoRequest;
import com.senac.aula.application.dto.pedido.PedidoResponse;
import com.senac.aula.application.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos") // Removido prefixo /empresa para ser genérico
@RequiredArgsConstructor
// @PreAuthorize REMOVIDO: A segurança agora é feita dentro do Service (Regra de Negócio)
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoResponse> criar(@RequestBody @Valid PedidoRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoService.criarPedido(req));
    }

    @GetMapping
    public ResponseEntity<List<PedidoResponse>> listar() {
        return ResponseEntity.ok(pedidoService.listarPedidos());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PedidoResponse> atualizar(@PathVariable Long id, @RequestBody @Valid PedidoRequest req) {
        return ResponseEntity.ok(pedidoService.atualizarPedido(id, req));
    }

    @PutMapping("/{id}/avancar")
    public ResponseEntity<PedidoResponse> avancar(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.avancarStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        pedidoService.excluirPedido(id);
        return ResponseEntity.noContent().build();
    }
}