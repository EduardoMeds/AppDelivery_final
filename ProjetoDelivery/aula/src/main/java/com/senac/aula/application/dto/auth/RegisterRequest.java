package com.senac.aula.application.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO utilizado para receber dados de cadastro.
 * - nome, email, senha, cpf, cnpj
 *
 * Observação: não há campo 'tipo'; o backend determina CLIENTE/EMPRESA pela presença de cpf/cnpj.
 */
public record RegisterRequest(
        @NotBlank(message = "O nome não pode ser vazio")
        String nome,

        @NotBlank(message = "O email não pode ser vazio")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "A senha não pode ser vazia")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        String senha,

        // CPF e CNPJ são opcionais para o registro, a lógica de tipo é no backend.
        // Se precisar de validação de formato para CPF/CNPJ, adicione @Pattern
        String cpf,
        String cnpj
) {}