
package com.senac.aula.infra.adapter; // Está na camada de infraestrutura, fora do domínio

import com.senac.aula.domain.EmailSenderPort; // Importamos a interface que criamos no Passo 1
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage; // Classe do Spring para e-mails simples
import org.springframework.mail.javamail.JavaMailSender; // Interface do Spring para enviar e-mails de verdade
import org.springframework.stereotype.Component; // Marca esta classe como um componente do Spring
import org.springframework.beans.factory.annotation.Value; // Para pegar valores do application.properties

// Esta classe é o nosso "Adaptador". Ela implementa a Porta (o contrato) do domínio.
// Ela sabe os detalhes técnicos de COMO enviar um e-mail.
@Component // Avisa o Spring que ele deve criar e gerenciar uma instância desta classe
@RequiredArgsConstructor // Gera um construtor que injeta automaticamente campos 'final'
public class EmailSenderAdapter implements EmailSenderPort { // Implementamos a interface do domínio

    // O Spring vai automaticamente nos dar uma instância de JavaMailSender
    // (com base nas configurações do seu application.properties).
    private final JavaMailSender mailSender;

    // Pegamos o email do remetente diretamente do seu application.properties
    @Value("${spring.mail.username}")
    private String remetenteEmail;

    // Implementamos o método que está na nossa interface (EmailSenderPort)
    @Override
    public void sendOrderConfirmationEmail(String recipientEmail, String orderDescription, String customerName) {
        // Criamos um objeto de mensagem de e-mail simples
        SimpleMailMessage message = new SimpleMailMessage();

        // Configuramos quem está enviando o e-mail
        message.setFrom(remetenteEmail);
        // Configuramos para quem estamos enviando o e-mail
        message.setTo(recipientEmail);
        // Definimos o assunto do e-mail
        message.setSubject("Confirmação do seu pedido #" + System.currentTimeMillis()); // O System.currentTimeMillis() é só um número único para o assunto, você pode melhorar isso depois.

        // Definimos o conteúdo do corpo do e-mail
        message.setText(
                "Olá " + customerName + ",\n\n" +
                        "Seu pedido com a descrição:\n\"" + orderDescription + "\"\n" +
                        "foi recebido e está sendo processado!\n\n" +
                        "Aguarde novas atualizações.\n\n" +
                        "Obrigado por escolher nossos serviços!"
        );

        try {
            // Tentamos enviar o e-mail usando o JavaMailSender
            mailSender.send(message);
            System.out.println("E-mail de confirmação enviado para: " + recipientEmail);
        } catch (Exception e) {
            // Se algo der errado no envio, imprimimos um erro no console.
            // Em um sistema de verdade, usaríamos um logger (como SLF4J/Logback) aqui.
            // Importante: A criação do pedido NÃO DEVE FALHAR se o e-mail falhar.
            // Por isso, capturamos a exceção aqui e não a relançamos.
            System.err.println("Erro ao enviar e-mail de confirmação para " + recipientEmail + ": " + e.getMessage());
        }
    }
}