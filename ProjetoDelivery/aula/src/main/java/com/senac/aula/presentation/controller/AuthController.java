package com.senac.aula.presentation.controller;

import com.senac.aula.application.dto.auth.LoginRequest;
import com.senac.aula.application.dto.auth.LoginResponse;
import com.senac.aula.application.dto.auth.RegisterRequest;
import com.senac.aula.application.service.AuthService;
import jakarta.validation.Valid; // Importante: adicionar esta anotação!
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public void registrar(@RequestBody @Valid RegisterRequest req) { // Adicionado @Valid
        authService.registrar(req);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid LoginRequest req) { // Adicionado @Valid
        return authService.login(req);
    }
}