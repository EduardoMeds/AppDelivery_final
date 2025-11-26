
package com.senac.aula.domain;


public interface EmailSenderPort {


    void sendOrderConfirmationEmail(String recipientEmail, String orderDescription, String customerName);
}
