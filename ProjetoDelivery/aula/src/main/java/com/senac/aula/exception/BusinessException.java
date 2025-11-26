package com.senac.aula.exception;

/** Exception para regras de negócio específicas (lançar quando validação falhar). */
public class BusinessException extends RuntimeException {
    public BusinessException(String msg) { super(msg); }
}