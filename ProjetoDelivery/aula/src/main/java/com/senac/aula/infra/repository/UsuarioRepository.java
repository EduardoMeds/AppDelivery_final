package com.senac.aula.infra.repository;

import com.senac.aula.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repositório Spring Data para a entidade Usuario.
 * - findByEmail é usado para autenticação/login.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
}