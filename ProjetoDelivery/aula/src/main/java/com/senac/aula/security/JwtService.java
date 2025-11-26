package com.senac.aula.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.senac.aula.domain.model.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    // Alterado para 'jwt.expiration' conforme seu application.properties e o nome mais comum
    @Value("${jwt.expiration:86400000}") // Default de 24h em milissegundos, caso não configurado
    private long expiracaoMilisegundos;

    /**
     * Gera token JWT com dados básicos do usuário.
     */
    public String gerarToken(Usuario usuario) {
        Algorithm alg = Algorithm.HMAC256(secret);

        return JWT.create()
                .withIssuer("senac-api")
                .withSubject(usuario.getEmail())
                .withClaim("id", usuario.getId())
                .withClaim("tipo", usuario.getTipo().name())
                .withIssuedAt(new Date())
                // Usando a nova propriedade de expiração em milissegundos
                .withExpiresAt(new Date(System.currentTimeMillis() + expiracaoMilisegundos))
                .sign(alg);
    }

    /**
     * Extrai o email (subject) do token.
     */
    public String extrairEmail(String token) {
        Algorithm alg = Algorithm.HMAC256(secret);
        return JWT.require(alg)
                .withIssuer("senac-api")
                .build()
                .verify(token)
                .getSubject();
    }

    /**
     * Verifica se o token é válido.
     */
    public boolean tokenValido(String token) {
        try {
            extrairEmail(token); // Tenta extrair. Se houver erro (expiração, assinatura inválida), lança exceção.
            return true;
        } catch (Exception e) {
            // Logar a exceção aqui seria útil para debug, mas para o método, basta retornar false.
            return false;
        }
    }
}