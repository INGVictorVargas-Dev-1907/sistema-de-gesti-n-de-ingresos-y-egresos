import { vi } from 'vitest';

// Mock de next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: vi.fn(),
    replace: vi.fn(),
    query: {},
  }),
}));

// Mock de next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: any) => children,
}));

// Mock global para fetch
global.fetch = vi.fn();