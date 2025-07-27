import { TransactionType } from "@prisma/client";
import { z } from "zod";

export const createTransactionSchema = z.object({
  concept: z.string().min(1, "El concepto es requerido").max(255, "El concepto es muy largo"),
  amount: z.number().positive("El monto debe ser positivo"),
  date: z.date({
    required_error: "La fecha es requerida",
  }),
  type: z.nativeEnum(TransactionType, {
    required_error: "El tipo de transacción es requerido",
  }),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;