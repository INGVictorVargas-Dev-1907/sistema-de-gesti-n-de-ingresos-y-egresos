import handler from "../../pages/api/transactions/index";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock de getServerSession
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

// Mock de los casos de uso
vi.mock("@/core/application/use-cases/TransactionUseCases", () => ({
  TransactionUseCases: vi.fn().mockImplementation(() => ({
    getAllTransactions: vi.fn().mockResolvedValue([
      { id: "1", concept: "Test", amount: 100, type: "INCOME" },
    ]),
    createTransaction: vi.fn().mockResolvedValue({
      id: "2", concept: "Venta", amount: 2000, type: "INCOME",
    }),
  })),
}));

// Mock del repositorio
vi.mock("@/infrastructure/repositories/PrismaTransactionRepository", () => ({
  PrismaTransactionRepository: vi.fn(),
}));

describe("/api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 for unauthenticated requests", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue(null);

    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      message: "No autorizado: Debes iniciar sesión para acceder.",
    });
  });

  it("should handle GET requests for authenticated users", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue({
      user: { id: "1", email: "test@test.com", role: "ADMIN" },
    });

    const { req, res } = createMocks({ method: "GET" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual([
      { id: "1", concept: "Test", amount: 100, type: "INCOME" },
    ]);
  });

  it("should return 405 for unsupported methods", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue({
      user: { id: "1", email: "test@test.com", role: "ADMIN" },
    });

    const { req, res } = createMocks({ method: "PATCH" });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Método PATCH no permitido",
    });
  });

  it("should return 400 if transaction data is invalid", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue({
      user: { id: "1", email: "admin@test.com", role: "ADMIN" },
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        concept: "",
        amount: "texto",
        date: "invalid-date",
        type: "UNKNOWN",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const response = JSON.parse(res._getData());
    expect(response.message).toBe("Datos inválidos para crear la transacción.");
    expect(Array.isArray(response.details)).toBe(true);
  });

  it("should return 403 if user role is not ADMIN", async () => {
    const { getServerSession } = await import("next-auth/next");
    (getServerSession as any).mockResolvedValue({
      user: { id: "2", email: "user@test.com", role: "USER" },
    });

    const { req, res } = createMocks({
      method: "POST",
      body: {
        concept: "Ingreso",
        amount: 500,
        date: "2024-01-15",
        type: "INCOME",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    const response = JSON.parse(res._getData());
    expect(response.message).toBe("Permisos insuficientes");
  });

  it("should return 500 if createTransaction throws unexpected error", async () => {
    const { getServerSession } = await import("next-auth/next");
    const { TransactionUseCases } = await import("@/core/application/use-cases/TransactionUseCases");

    (getServerSession as any).mockResolvedValue({
      user: { id: "1", email: "admin@test.com", role: "ADMIN" },
    });

    (TransactionUseCases as any).mockImplementation(() => ({
      createTransaction: vi.fn().mockRejectedValue(new Error("Error inesperado")),
    }));

    const { req, res } = createMocks({
      method: "POST",
      body: {
        concept: "Compra",
        amount: 1000,
        date: "2024-01-15",
        type: "EXPENSE",
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    const response = JSON.parse(res._getData());
    expect(response.message).toBe("Error interno del servidor. Por favor, intente de nuevo más tarde.");
  });
});
