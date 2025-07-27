/**
 * Entity: User
 * Representa un usuario del sistema con sus propiedades y comportamientos básicos
 */
export interface User {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Value Object: UserRole
 * Define los roles disponibles en el sistema
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

/**
 * Domain Service: UserService
 * Contiene la lógica de negocio relacionada con usuarios
 */
export class UserDomainService {
  /**
   * Verifica si un usuario tiene permisos de administrador
   */
  static isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }

  /**
   * Verifica si un usuario puede acceder a la gestión de usuarios
   */
  static canManageUsers(user: User): boolean {
    return this.isAdmin(user);
  }

  /**
   * Verifica si un usuario puede ver reportes
   */
  static canViewReports(user: User): boolean {
    return this.isAdmin(user);
  }
}