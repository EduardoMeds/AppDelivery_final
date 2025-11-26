package com.senac.aula.domain.enums;

/**
 * Estados possíveis de um pedido de delivery.
 * A enumeração facilita avanço de estado e validações.
 */
public enum StatusPedido {
    RECEBIDO,
    EM_PREPARO,
    A_CAMINHO,
    ENTREGUE
}