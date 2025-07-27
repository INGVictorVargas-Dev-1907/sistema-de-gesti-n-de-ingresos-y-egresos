import {
    AppError,
    UnauthorizedError
} from "@/core/domain/errors/AppErrors";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";

/**
 * @swagger
 * /api/auth/logout-github:
 *   post:
 *     summary: Cierra la sesión y desvincula la cuenta de GitHub del usuario.
 *     description: >
 *       Este endpoint permite a un usuario cerrar su sesión actual de NextAuth.js y,
 *       de forma simultánea, eliminar la vinculación de su cuenta de GitHub de la base de datos.
 *       Esto asegura que, en futuros intentos de inicio de sesión con GitHub, el usuario
 *       será redirigido a la página de autorización de GitHub como si fuera la primera vez.
 *     tags:
 *       - Autenticación
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente y cuenta de GitHub desvinculada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sesión cerrada y cuenta de GitHub desvinculada."
 *       405:
 *         description: Método no permitido. Solo se acepta POST.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Método GET No Permitido"
 *       500:
 *         description: Error interno del servidor al intentar desvincular la cuenta de GitHub.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al intentar desvincular la cuenta de GitHub."
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") {
            res.setHeader("Allow", ["POST"]);
            throw new AppError(`Método ${req.method} No Permitido`, 405);
        }

        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
            throw new UnauthorizedError("No autorizado: Sesión no encontrada o inválida.");
        }

        await prisma.account.deleteMany({
            where: {
                userId: session.user.id,
                provider: "github",
            },
        });
        console.log(`Cuenta de GitHub para el usuario ${session.user.id} eliminada de la DB.`);

        return res.status(200).json({ message: "Cuenta de GitHub desvinculada." });

    } catch (error) {
        console.error("Error en /api/auth/logout-github:", error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                message: error.message,
                details: error.details,
            });
        } else if (error instanceof Error) {
            return res.status(500).json({
                message: 'Error interno del servidor. Por favor, intente de nuevo más tarde.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }else {
            return res.status(500).json({
                message: 'Ocurrió un error inesperado.',
            });
        }
    }
}
