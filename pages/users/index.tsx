import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserEditForm } from '@/components/users/UserEditForm';
import { UserTable } from '@/components/users/UserTable';
import { User } from '@/core/domain/entities/User';
import { UpdateUserInput } from '@/lib/validations/user';
import { AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

/**
 * Users Page
 * Página para la gestión de usuarios (solo administradores)
 */
export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin && session) {
      router.push('/');
      return;
    }
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, session]);

  const fetchUsers = async () => {
    try {
      setError('');
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Error al cargar los usuarios');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserInput) => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el usuario');
      }

      await fetchUsers();
      setEditingUser(null);
    } catch (err: any) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin && session) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios y sus permisos en el sistema</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <UserTable
        users={users}
        onEdit={setEditingUser}
        isLoading={isLoading}
      />

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="w-full max-h-[95vh] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-lg overflow-y-auto p-8 border">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserEditForm
              user={editingUser}
              onSubmit={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}