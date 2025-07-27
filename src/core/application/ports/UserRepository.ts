import { User } from '@/core/domain/entities/User';
import { UpdateUserInput } from '@/lib/validations/user';

/**
 * Port: UserRepository
 * Define el contrato para el repositorio de usuarios
 */
export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: UpdateUserInput): Promise<User>;
}