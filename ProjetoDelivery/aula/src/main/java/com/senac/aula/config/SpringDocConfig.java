package com.senac.aula.config;

import io.swagger.v3.oas.models.Components; // Componentes da especificação OpenAPI
import io.swagger.v3.oas.models.OpenAPI; // Objeto OpenAPI principal
import io.swagger.v3.oas.models.info.Info; // Informações da API (título, versão, etc.)
import io.swagger.v3.oas.models.security.SecurityRequirement; // Requisito de segurança (JWT)
import io.swagger.v3.oas.models.security.SecurityScheme; // Esquema de segurança (Bearer Token)
import org.springframework.context.annotation.Bean; // Anotação para declarar beans
import org.springframework.context.annotation.Configuration; // Indica que é uma classe de configuração

/**
 * Classe de configuração para o SpringDoc OpenAPI (Swagger UI).
 * Define informações gerais da API e configura o esquema de segurança (JWT Bearer Token)
 * para que seja possível testar endpoints protegidos diretamente pelo Swagger UI.
 */
@Configuration // Indica ao Spring que esta é uma classe de configuração.
public class SpringDocConfig {

    /**
     * Configura o objeto OpenAPI que descreve a API.
     * Inclui informações básicas da API e a configuração para o JWT (Bearer Token).
     */
    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth"; // Nome para o esquema de segurança JWT

        return new OpenAPI()
                .info(new Info() // Informações gerais da API
                        .title("API Delivery Senac") // Título da sua API
                        .description("API RESTful para gerenciamento de pedidos de delivery.") // Descrição
                        .version("1.0.0") // Versão da API
                )
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName)) // Adiciona o requisito de segurança (JWT) globalmente
                .components(new Components() // Define os componentes da especificação OpenAPI
                        .addSecuritySchemes(securitySchemeName, // Adiciona o esquema de segurança com o nome definido
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP) // Tipo de esquema de segurança (HTTP)
                                        .scheme("bearer") // Esquema "bearer" para JWT
                                        .bearerFormat("JWT") // Formato do token bearer
                        )
                );
    }
}

