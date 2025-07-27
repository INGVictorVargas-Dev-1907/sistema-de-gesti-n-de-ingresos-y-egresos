import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  DollarSign,
  Home,
  Loader2,
  LogIn,
  LogOut,
  TrendingUp,
  Users
} from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * Layout Component
 * Componente de layout principal que maneja la navegación y autenticación
 */
export function Layout({ children, title = 'Sistema de Gestión Financiera' }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';

  const handleLogoutAndForceGithubReauth = async () => {
    let githubUnlinkedSuccessfully = false;

    try {
      const response = await fetch("/api/auth/logout-github", {
        method: "POST",
      });

      if (response.ok) {
        console.log("Cuenta de GitHub desvinculada exitosamente del servidor.");
        githubUnlinkedSuccessfully = true;
      } else {
        const errorData = await response.json();
        console.error("Error al desvincular la cuenta de GitHub:", errorData.error);
        alert(`Error al desvincular GitHub: ${errorData.error || 'Ocurrió un error desconocido.'}\nSe cerrará tu sesión, pero la vinculación con GitHub podría persistir.`);
      }
    } catch (error) {
      console.error("Error en la llamada a /api/auth/logout-github:", error);
      alert("No se pudo contactar al servidor para desvincular GitHub. Se cerrará tu sesión, pero la vinculación podría persistir.");
    }

    await signOut({ callbackUrl: "/" });
  };

  // Si la sesión está cargando (estado intermedio entre no autenticado y autenticado)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión, mostrar página de login
  if (!isLoading && !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Financiera</h1>
                <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
              </div>
              <Button 
                onClick={() => signIn('github')}
                className="w-full"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar sesión con GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = session?.user?.role === 'ADMIN';

  const navigationItems = [
    {
      href: '/',
      icon: Home,
      label: 'Inicio',
      active: router.pathname === '/',
    },
    {
      href: '/transactions',
      icon: TrendingUp,
      label: 'Transacciones',
      active: router.pathname.startsWith('/transactions'),
    },
    ...(isAdmin ? [
      {
        href: '/users',
        icon: Users,
        label: 'Usuarios',
        active: router.pathname.startsWith('/users'),
      },
      {
        href: '/reports',
        icon: BarChart3,
        label: 'Reportes',
        active: router.pathname.startsWith('/reports'),
      },
    ] : []),
  ];

  // Renderizado del layout principal para usuarios autenticados
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Hola, {session?.user?.name || session?.user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogoutAndForceGithubReauth}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}