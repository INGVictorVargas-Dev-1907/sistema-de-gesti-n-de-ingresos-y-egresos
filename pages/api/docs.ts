import { swaggerSpec } from '@/lib/swagger';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Obtiene la documentación de la API en formato OpenAPI/Swagger
 *     tags: [Documentación]
 *     responses:
 *       200:
 *         description: Especificación OpenAPI de la API
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerSpec);
}