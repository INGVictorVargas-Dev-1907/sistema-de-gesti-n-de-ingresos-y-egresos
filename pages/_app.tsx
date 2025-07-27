import Head from 'next/head';
import '@/app/globals.css';
import { Layout } from '@/components/layout/Layout';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/toaster';
import type { AppProps } from 'next/app';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Mi Aplicación Financiera</title>
        <meta name="description" content="Gestión de ingresos, egresos y usuarios" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Layout>
        <Component {...pageProps} />
        <Toaster />
      </Layout>
    </SessionProvider>
  );
}
