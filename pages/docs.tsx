import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

/**
 * API Documentation Page
 * Página que muestra la documentación de la API usando Swagger UI
 */
export default function DocsPage() {
  const [spec, setSpec] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchApiSpec();
  }, []);

  const fetchApiSpec = async () => {
    try {
      const response = await fetch('/api/docs');
      if (!response.ok) {
        throw new Error('Error al cargar la documentación');
      }
      const data = await response.json();
      setSpec(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la documentación');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentación de la API</h1>
          <p className="text-gray-600">Especificación OpenAPI/Swagger de los endpoints</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentación de la API</h1>
          <p className="text-gray-600">Especificación OpenAPI/Swagger de los endpoints</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentación de la API</h1>
        <p className="text-gray-600">Especificación OpenAPI/Swagger de los endpoints</p>
      </div>
      
      <div className="bg-white rounded-lg border">
        {spec && <SwaggerUI spec={spec} />}
      </div>
    </div>
  );
}