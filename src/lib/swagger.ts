import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
        title: 'Sistema de Gestión Financiera API',
        version: '1.0.0',
        description: 'API para la gestión de ingresos, egresos y usuarios',
        },
        servers: [
        {
            url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            description: 'Servidor de desarrollo',
        },
        ],
        components: {
        securitySchemes: {
            BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            },
        },
        schemas: {
            Transaction: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                concept: { type: 'string' },
                amount: { type: 'number' },
                date: { type: 'string', format: 'date-time' },
                type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                userId: { type: 'string' },
                user: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                },
                },
            },
            },
            User: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                phone: { type: 'string' },
                role: { type: 'string', enum: ['USER', 'ADMIN'] },
            },
            },
            Error: {
            type: 'object',
            properties: {
                error: { type: 'string' },
            },
            },
        },
        },
    },
    apis: ['./pages/api/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);