import { useState } from 'react';
import { User } from '@/core/domain/entities/User';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  isLoading?: boolean;
}

/**
 * UserTable Component
 * Tabla para mostrar los usuarios del sistema
 */
export function UserTable({ users, onEdit, isLoading = false }: UserTableProps) {
  const getRoleBadge = (role: string) => {
    return role === 'ADMIN' ? 'default' : 'secondary';
  };

  const getRoleLabel = (role: string) => {
    return role === 'ADMIN' ? 'Administrador' : 'Usuario';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || 'Sin nombre'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'No especificado'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadge(user.role) as any}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}