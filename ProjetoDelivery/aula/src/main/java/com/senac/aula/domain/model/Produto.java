package com.senac.aula.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private BigDecimal preco;

    private String categoria; // Ex: Lanches, Bebidas

    // O produto pertence a uma empresa específica
    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Usuario empresa;
}