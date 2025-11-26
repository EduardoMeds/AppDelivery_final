package com.senac.aula.presentation.controller;

import com.senac.aula.domain.model.Produto;
import com.senac.aula.domain.model.Usuario;
import com.senac.aula.infra.repository.ProdutoRepository;
import com.senac.aula.infra.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empresa/produtos")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    // Helper para pegar empresa logada
    private Usuario getEmpresaLogada() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
    }

    @GetMapping
    public List<Produto> listar() {
        return produtoRepository.findByEmpresa(getEmpresaLogada());
    }

    @PostMapping
    public Produto criar(@RequestBody Produto produto) {
        produto.setEmpresa(getEmpresaLogada());
        return produtoRepository.save(produto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Produto produto = produtoRepository.findById(id).orElse(null);
        Usuario empresa = getEmpresaLogada();

        // Segurança: Garante que o produto pertence a quem está tentando apagar
        if (produto != null && produto.getEmpresa().getId().equals(empresa.getId())) {
            produtoRepository.delete(produto);
        }
        return ResponseEntity.noContent().build();
    }
}