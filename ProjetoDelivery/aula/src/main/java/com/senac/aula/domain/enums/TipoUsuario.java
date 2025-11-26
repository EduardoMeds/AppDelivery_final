package com.senac.aula.domain.enums;

/**
 * Tipos de usuário do sistema.
 * - CLIENTE: pessoa que faz pedidos
 * - EMPRESA: dono/conta do restaurante
 *
 * Usamos enum para garantir valores fixos e evitar strings soltas.
 */
public enum TipoUsuario {
    CLIENTE,
    EMPRESA
}