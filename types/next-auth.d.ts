import { Role, TransactionType } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        role: Role;
        phone?: string | null;
        transactions?: {
        id: string;
        concept: string;
        amount: number;
        date: Date;
        type: TransactionType;
        }[];
    }

    interface Session {
        user: {
        id: string;
        role: Role;
        phone?: string | null;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: Role;
        phone?: string | null;
    }
}