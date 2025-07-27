import { UserRepository } from '@/core/application/ports/UserRepository';
import { User } from '@/core/domain/entities/User';
import { prisma } from '@/lib/db';
import { UpdateUserInput } from '@/lib/validations/user';

/**
 * Adapter: Prisma User Repository
 * Implementación del repositorio de usuarios usando Prisma
 */
export class PrismaUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return users.map(this.mapToDomain);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    return user ? this.mapToDomain(user) : null;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    
    return this.mapToDomain(user);
  }

  private mapToDomain(user: any): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}