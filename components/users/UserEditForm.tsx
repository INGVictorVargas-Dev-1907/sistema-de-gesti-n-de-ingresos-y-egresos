import { UpdateUserInput, updateUserSchema } from '@/lib/validations/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

// Importamos el tipo User de tu dominio
import { User } from '@/core/domain/entities/User';

// Importaciones de Shadcn/ui
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Importaciones de Lucide React para iconos
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Loader2, Phone, Save, Shield, ShieldCheck, User as UserIcon, X } from 'lucide-react';

// Importamos Role directamente de @prisma/client
import { Role } from '@prisma/client';

interface UserEditFormProps {
  user: User;
  onSubmit: (data: UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * UserEditForm Component
 * Formulario para editar usuarios existentes
 * Presentation Layer - Forms (como se indica en tu estructura de código)
 */
export function UserEditForm({ user, onSubmit, onCancel, isLoading = false }: UserEditFormProps) {
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name || '',
      role: user.role as Role,
      phone: user.phone || '',
    },
    mode: 'onChange'
  });

  const watchedRole = watch('role');

  const handleFormSubmit = async (data: UpdateUserInput) => {
    try {
      setError('');
      await onSubmit(data);

      if (user.role === Role.ADMIN && data.role === Role.USER) {
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, roleChanged: 'true' },
          },
          undefined,
          { shallow: true }
        );
      } else {
        toast({
          title: 'Usuario actualizado',
          description: `Los datos de ${user.name || user.email} se guardaron correctamente.`,
          duration: 4000,
        });
      }


    } catch (err: any) {
      console.error('Error al actualizar usuario:', err);
      setError(err.message || 'Error desconocido al actualizar el usuario. Intenta de nuevo.');
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg border-b">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-semibold text-primary">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Editar Usuario</h2>
            <p className="text-sm text-muted-foreground">
              Modificando perfil de <span className="font-medium text-gray-700">{user.name || user.email}</span>
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al Actualizar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 p-4 bg-muted/40 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                Detalles del Usuario
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="space-y-1">
                    <Label className="text-muted-foreground block mb-1">Email</Label>
                    <p className="font-medium text-gray-700 p-2 bg-background rounded-md border border-input break-words">{user.email}</p>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground block mb-1">Fecha de registro</Label>
                    <p className="font-medium text-gray-700 p-2 bg-background rounded-md border border-input">
                        {new Date(user.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="space-y-1">
                    <Label className="text-muted-foreground block mb-1">Última actualización</Label>
                    <p className="font-medium text-gray-700 p-2 bg-background rounded-md border border-input">
                        {new Date(user.updatedAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Save className="w-4 h-4 text-muted-foreground" />
                Información Editable
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nombre Completo</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Nombre completo del usuario"
                  {...register('name')}
                  className={`pl-10 h-10 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="Número de teléfono (opcional)"
                  {...register('phone')}
                  className={`pl-10 h-10 ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">Rol del Usuario</Label>
              <Select
                value={watchedRole}
                onValueChange={(value) => {
                  setValue('role', value as Role, { shouldValidate: true, shouldDirty: true });
                }}
              >
                <SelectTrigger className={`h-10 ${errors.role ? 'border-destructive focus-visible:ring-destructive' : ''}`}>
                  <SelectValue placeholder="Selecciona el rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.USER}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Usuario</p>
                        <p className="text-xs text-muted-foreground">
                          Acceso limitado a movimientos
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={Role.ADMIN}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium">Administrador</p>
                        <p className="text-xs text-muted-foreground">
                          Acceso completo al sistema
                        </p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
              )}

              <div className="p-4 bg-accent/30 border border-border rounded-lg text-sm mt-3">
                {watchedRole === Role.ADMIN ? (
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-primary mb-1">Privilegios de Administrador</p>
                      <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
                        <li>Gestionar todos los movimientos financieros</li>
                        <li>Administrar usuarios del sistema</li>
                        <li>Acceder a reportes y análisis</li>
                        <li>Configurar parámetros del sistema</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Privilegios de Usuario</p>
                      <ul className="text-muted-foreground text-xs space-y-1 list-disc list-inside">
                        <li>Ver movimientos financieros (¡Solo Vista!)</li>
                        <li>Acceso limitado a funcionalidades</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 h-10 text-lg font-semibold"
              disabled={!isValid || !isDirty || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Guardar Cambios
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 h-10 text-lg font-semibold"
            >
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </Button>
          </div>

          {isDirty && (
            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center gap-3 mt-4 animate-pulse">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-medium">¡Atención! Hay cambios sin guardar en este formulario.</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}