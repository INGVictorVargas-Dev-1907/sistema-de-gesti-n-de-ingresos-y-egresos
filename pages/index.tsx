import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

/**
 * Home Page
 * Página principal con navegación a las secciones principales
 */
export default function HomePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const menuItems = [
    {
      title: 'Gestión de Transacciones',
      description: 'Administra ingresos y egresos del sistema',
      icon: TrendingUp,
      href: '/transactions',
      available: true,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios y sus permisos',
      icon: Users,
      href: '/users',
      available: isAdmin,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Reportes Financieros',
      description: 'Visualiza reportes y métricas financieras',
      icon: BarChart3,
      href: '/reports',
      available: isAdmin,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sistema de Gestión Financiera
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Controla tus ingresos y egresos de manera profesional
          </p>
        </div>
      </div>

      {!isAdmin && (
        <Card className="max-w-2xl mx-auto bg-red-50 border-red-200 animate-pulse-5s">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800">
                ¡ Acceso Limitado !
              </h3>
              <p className="text-red-700 mt-2">
                Tu cuenta tiene permisos de usuario. Algunas funciones y vistas de la aplicación estén restringidas y puede que no se carguen para tu rol especifico.
                <span className="font-semibold"> Al cerrar sesión y volver a iniciarla, tu rol de Administrador será restaurado.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto flex justify-center ">
        {menuItems
          .filter(item => item.available)
          .map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex justify-center">
                <Card className="w-full sm:w-auto md:w-auto lg:w-auto hover:shadow-lg transition-shadow duration-200 max-w-sm">
                  <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className={`p-3 rounded-xl ${item.color}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        {item.description}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={item.href}>
                      <Button className="w-full" size="lg">
                        Acceder
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            );
          })}
      </div>
    </div>
  );
}