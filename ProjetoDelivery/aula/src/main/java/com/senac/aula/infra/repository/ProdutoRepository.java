package com.senac.aula.infra.repository;

import com.senac.aula.domain.model.Produto;
import com.senac.aula.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    // Busca produtos apenas da empresa logada
    List<Produto> findByEmpresa(Usuario empresa);
}