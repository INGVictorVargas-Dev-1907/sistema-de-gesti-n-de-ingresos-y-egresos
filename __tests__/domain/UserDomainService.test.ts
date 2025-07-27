import { UserDomainService, UserRole } from '@/core/domain/entities/User';
import { describe, expect, it } from 'vitest';

describe('UserDomainService', () => {
  const adminUser = {
    id: '1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const regularUser = {
    id: '2',
    email: 'user@test.com',
    name: 'Regular User',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should identify admin users correctly', () => {
    expect(UserDomainService.isAdmin(adminUser)).toBe(true);
    expect(UserDomainService.isAdmin(regularUser)).toBe(false);
  });

  it('should validate user management permissions', () => {
    expect(UserDomainService.canManageUsers(adminUser)).toBe(true);
    expect(UserDomainService.canManageUsers(regularUser)).toBe(false);
  });

  it('should validate report viewing permissions', () => {
    expect(UserDomainService.canViewReports(adminUser)).toBe(true);
    expect(UserDomainService.canViewReports(regularUser)).toBe(false);
  });
});