// src/core/domain/errors/AppErrors.ts

/**
 * Clase base para errores de la aplicación.
 * Permite manejar errores de forma más estructurada.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly details?: any;

    constructor(message: string, statusCode: number = 500, details?: any) {
        super(message);
        this.name = this.constructor.name; // Asegura que el nombre del error sea el de la clase que lo extiende
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, AppError.prototype); // Necesario para herencia con clases custom en algunos entornos
    }
}

/**
 * Error para recursos no encontrados (HTTP 404).
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso no encontrado') {
        super(message, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Error para acceso no autorizado (HTTP 401).
 * Usado cuando el usuario no está autenticado.
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'No autorizado') {
        super(message, 401);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

/**
 * Error para permisos insuficientes (HTTP 403).
 * Usado cuando el usuario está autenticado pero no tiene los permisos para realizar la acción.
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Permisos insuficientes') {
        super(message, 403);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

/**
 * Error para datos de entrada inválidos (HTTP 400).
 */
export class ValidationError extends AppError {
    constructor(message: string = 'Datos inválidos', details?: any) {
        super(message, 400, details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Error genérico del servidor (HTTP 500).
 */
export class InternalServerError extends AppError {
    constructor(message: string = 'Error interno del servidor', details?: any) {
        super(message, 500, details);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
