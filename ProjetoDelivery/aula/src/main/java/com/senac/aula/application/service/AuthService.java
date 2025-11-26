package com.senac.aula.application.service;

import com.senac.aula.application.dto.auth.*;
import com.senac.aula.domain.enums.TipoUsuario;
import com.senac.aula.domain.model.Usuario;
import com.senac.aula.infra.repository.UsuarioRepository;
import com.senac.aula.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void registrar(RegisterRequest req) {

        if (usuarioRepository.findByEmail(req.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Usuario u = Usuario.builder()
                .nome(req.nome())
                .email(req.email())
                .senha(passwordEncoder.encode(req.senha()))
                .cpf(req.cpf())
                .cnpj(req.cnpj())
                .tipo((req.cnpj() != null && !req.cnpj().isBlank()) ?
                        TipoUsuario.EMPRESA : TipoUsuario.CLIENTE)
                .build();

        usuarioRepository.save(u);
    }

    public LoginResponse login(LoginRequest req) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.senha())
        );

        Usuario usuario = usuarioRepository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        String token = jwtService.gerarToken(usuario);

        return new LoginResponse(token, usuario.getNome(), usuario.getTipo().name());
    }
}