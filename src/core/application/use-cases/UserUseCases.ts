import { User, UserDomainService } from '@/core/domain/entities/User';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError
} from '@/core/domain/errors/AppErrors';
import { UpdateUserInput } from '@/lib/validations/user';
import { UserRepository } from '../ports/UserRepository';

/**
 * Use Case: Gestión de Usuarios.
 * Implementa los casos de uso relacionados con la gestión de usuarios.
 */
export class UserUseCases {
  constructor(private userRepository: UserRepository) {}

  /**
   * Obtiene todos los usuarios del sistema.
   * Solo disponible para administradores.
   * @param currentUser El usuario que realiza la solicitud.
   * @returns Una promesa que resuelve con una lista de usuarios.
   * @throws ForbiddenError Si el usuario actual no es administrador.
   * @throws InternalServerError Si ocurre un error inesperado en la capa de persistencia.
   */
  async getAllUsers(currentUser: User): Promise<User[]> {
    if (!UserDomainService.canManageUsers(currentUser)) {
      throw new ForbiddenError('Solo los administradores pueden gestionar usuarios.');
    }

    try {
      return await this.userRepository.findAll();
    
    } catch (error) {
      console.error('Error al obtener todos los usuarios del repositorio:', error);
      throw new InternalServerError('Ocurrió un error inesperado al obtener los usuarios.');
    }
  }

  /**
   * Obtiene un usuario por su ID.
   * Un usuario puede ver su propio perfil; los administradores pueden ver cualquier perfil.
   * @param id El ID del usuario a buscar.
   * @param currentUser El usuario que realiza la solicitud.
   * @returns Una promesa que resuelve con el usuario encontrado.
   * @throws NotFoundError Si el usuario no se encuentra.
   * @throws ForbiddenError Si el usuario actual no tiene permisos para ver este perfil.
   * @throws InternalServerError Si ocurre un error inesperado en la capa de persistencia.
   */
  async getUserById(id: string, currentUser: User): Promise<User | null> {
    if (currentUser.id !== id && !UserDomainService.isAdmin(currentUser)) {
      throw new ForbiddenError('No tienes permisos para ver este usuario.');
    }

    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundError(`Usuario con ID ${id} no encontrado.`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error(`Error al obtener el usuario ${id} del repositorio:`, error);
      throw new InternalServerError('Ocurrió un error inesperado al recuperar el usuario.');
    }
  }

  /**
   * Actualiza un usuario.
   * Solo disponible para administradores con permisos de gestión de usuarios.
   * @param id El ID del usuario a actualizar.
   * @param data Los datos a actualizar.
   * @param currentUser El usuario que realiza la solicitud.
   * @returns Una promesa que resuelve con el usuario actualizado.
   * @throws NotFoundError Si el usuario a actualizar no se encuentra.
   * @throws ForbiddenError Si el usuario actual no tiene permisos o intenta una acción prohibida (ej. cambiar rol sin ser admin).
   * @throws InternalServerError Si ocurre un error inesperado en la capa de persistencia.
   */
  async updateUser(id: string, data: UpdateUserInput, currentUser: User): Promise<User> {
    if (!UserDomainService.canManageUsers(currentUser)) {
      throw new ForbiddenError('Solo los administradores pueden editar usuarios.');
    }

    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new NotFoundError(`Usuario con ID ${id} no encontrado para actualizar.`);
      }

      if (data.role && data.role !== existingUser.role && !UserDomainService.isAdmin(currentUser)) {
        throw new ForbiddenError('Solo los administradores pueden cambiar roles de usuario.');
      }

      const updatedUser = await this.userRepository.update(id, data);

      if (!updatedUser) {
        throw new InternalServerError('El usuario no pudo ser actualizado debido a un problema interno inesperado.');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error(`Error al actualizar el usuario ${id} en el repositorio:`, error);
      throw new InternalServerError('Ocurrió un error inesperado al actualizar el usuario.');
    }
  }
}