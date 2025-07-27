/**
 * Tipos de datos para el sistema de gestión financiera
 * Siguiendo principios de arquitectura limpia - Domain Layer
 */

export type UserRole = 'USER' | 'ADMIN';

export type MovementType = 'INGRESO' | 'EGRESO';

/**
 * Entidad Usuario - Representa un usuario del sistema
 */
export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Entidad Movimiento Financiero - Representa un ingreso o egreso
 */
export interface FinancialMovement {
    id: string;
    concept: string;
    amount: number;
    date: Date;
    type: MovementType;
    userId: string;
    userName: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * DTO para crear un nuevo movimiento
 */
export interface CreateMovementDto {
    concept: string;
    amount: number;
    date: Date;
    type: MovementType;
}

/**
 * DTO para actualizar un usuario
 */
export interface UpdateUserDto {
    name?: string;
    role?: UserRole;
}

/**
 * Resumen financiero para el dashboard
 */
export interface FinancialSummary {
    totalIngresos: number;
    totalEgresos: number;
    saldoActual: number;
    movimientosRecientes: FinancialMovement[];
}

/**
 * Datos para reportes
 */
export interface ReportData {
    movements: FinancialMovement[];
    summary: FinancialSummary;
    chartData: ChartDataPoint[];
}

/**
 * Punto de datos para gráficos
 */
export interface ChartDataPoint {
    date: string;
    ingresos: number;
    egresos: number;
    saldo: number;
}

/**
 * Contexto de autenticación
 */
export interface AuthContext {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

/**
 * Props para componentes que requieren permisos
 */
export interface RoleGuardProps {
    requiredRole?: UserRole;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}