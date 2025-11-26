package com.senac.aula.application.dto.pedido;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record PedidoRequest(
        @NotBlank(message = "A descrição é obrigatória")
        String descricao,

        @NotBlank(message = "O endereço é obrigatório")
        String endereco,

        BigDecimal valorTotal,

        // Novo: O cliente precisa dizer para QUAL empresa é o pedido
        Long empresaId
) {}