import { z } from "zod";
import { Role } from "@prisma/client";

export const updateUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  role: z.nativeEnum(Role, {
    required_error: "El rol es requerido",
  }),
  phone: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
