package com.senac.aula.application.dto.auth;

/**
 * DTO de resposta do login.
 * - token: JWT para autenticação
 * - nome: nome do usuário (útil no frontend)
 * - tipo: CLIENTE ou EMPRESA
 */
public record LoginResponse(String token, String nome, String tipo) {}