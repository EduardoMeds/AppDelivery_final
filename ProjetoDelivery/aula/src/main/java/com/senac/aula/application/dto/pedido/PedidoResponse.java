package com.senac.aula.application.dto.pedido;

import java.math.BigDecimal; // <--- Importante!
import java.time.LocalDateTime;

public record PedidoResponse(
        Long id,
        String descricao,
        String endereco,

        // NOVO CAMPO: Envia o valor para aparecer na tabela
        BigDecimal valorTotal,

        String status,
        LocalDateTime criadoEm
) {}