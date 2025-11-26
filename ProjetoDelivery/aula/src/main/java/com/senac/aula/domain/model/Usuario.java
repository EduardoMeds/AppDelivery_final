package com.senac.aula.domain.model;

import com.senac.aula.domain.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Entidade Usuario: representa tanto clientes quanto empresas (restaurantes).
 *
 * Observações:
 * - Implementa UserDetails para integrar com Spring Security facilmente.
 * - possui cpf (para cliente) e cnpj (para empresa). Em prePersist definimos tipo se necessário.
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome do usuário ou nome fantasia da empresa
    @Column(nullable = false)
    private String nome;

    // Email usado para login — único
    @Column(nullable = false, unique = true)
    private String email;

    // Senha já deve ser salva criptografada (BCrypt)
    @Column(nullable = false)
    private String senha;

    // CPF: apenas para usuários do tipo CLIENTE
    @Column(length = 20)
    private String cpf;

    // CNPJ: apenas para usuários do tipo EMPRESA
    @Column(length = 30)
    private String cnpj;

    // Tipo do usuário (CLIENTE / EMPRESA)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoUsuario tipo;

    /**
     * Antes de persistir, se tipo estiver null definimos automaticamente:
     * - se cnpj preenchido -> EMPRESA
     * - se cpf preenchido -> CLIENTE
     *
     * Isso facilita o cadastro onde o usuário só informa CPF ou CNPJ.
     */
    @PrePersist
    public void definirTipoSeNull() {
        if (this.tipo == null) {
            if (this.cnpj != null && !this.cnpj.isBlank()) {
                this.tipo = TipoUsuario.EMPRESA;
            } else {
                this.tipo = TipoUsuario.CLIENTE;
            }
        }
    }

    // ------- Métodos da interface UserDetails para Spring Security --------

    /**
     * Concede a autoridade ROLE_CLIENTE ou ROLE_EMPRESA dependendo do tipo.
     * Spring Security trabalha com "ROLE_xxx" por convenção.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + tipo.name()));
    }

    @Override
    public String getPassword() { return senha; }

    @Override
    public String getUsername() { return email; }

    // Para este trabalho mantemos conta sempre válida
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}