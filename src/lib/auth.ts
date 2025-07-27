import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Role } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: { params: { prompt: "consent" } },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!account || !user.email) return false;

      try {
        // 1. Verificar si el email existe con otro proveedor
        const usuarioConOtroProveedor = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: { select: { provider: true } } }
        });

        if (
          usuarioConOtroProveedor?.accounts.length &&
          !usuarioConOtroProveedor.accounts.some(a => a.provider === account.provider)
        ) {
          return `/auth/error?error=OAuthAccountNotLinked&message=Este email ya está registrado con ${usuarioConOtroProveedor.accounts[0].provider}`;
        }

        // 2. Crear o actualizar usuario
        const usuarioActualizadoOCreado = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: profile?.name || user.name,
            role: Role.ADMIN
          },
          create: {
            email: user.email,
            name: profile?.name || user.name,
            role: Role.ADMIN,
          },
        });

        // 3. Crear o actualizar cuenta con el ID correcto
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          },
          update: {
            userId: usuarioActualizadoOCreado.id,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
          create: {
            userId: usuarioActualizadoOCreado.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          },
        });

        return true;
      } catch (error) {
        console.error("Error en autenticación:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: process.env.NODE_ENV === "development",
};
