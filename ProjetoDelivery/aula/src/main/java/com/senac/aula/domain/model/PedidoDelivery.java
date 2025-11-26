package com.senac.aula.domain.model;

import com.senac.aula.domain.enums.StatusPedido;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "pedidos_delivery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private String endereco;

    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    private StatusPedido status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    // QUEM VENDE (Restaurante)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Usuario empresa;

    // QUEM COMPRA (Cliente) - Novo Campo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Usuario cliente;

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) criadoEm = LocalDateTime.now();
        if (status == null) status = StatusPedido.RECEBIDO;
        if (valorTotal == null) valorTotal = BigDecimal.ZERO;
    }
}