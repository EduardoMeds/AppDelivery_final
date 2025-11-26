package com.senac.aula.infra.repository;

import com.senac.aula.domain.model.PedidoDelivery;
import com.senac.aula.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<PedidoDelivery, Long> {
    List<PedidoDelivery> findByEmpresa(Usuario empresa);

    // Novo método para o histórico do cliente
    List<PedidoDelivery> findByCliente(Usuario cliente);
}