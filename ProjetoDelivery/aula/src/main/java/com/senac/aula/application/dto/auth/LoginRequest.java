package com.senac.aula.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** DTO para login (email + senha). */
public record LoginRequest(
        @NotBlank(message = "O email não pode ser vazio")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "A senha não pode ser vazia")
        String senha
) {}