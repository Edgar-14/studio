import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'BeFast Partner AI',
  description: 'Panel de socios impulsado por IA para la gestión de entregas.',
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
       <head>
        <link rel="icon" href="/android-chrome-192x192.png" type="image/png" sizes="192x192" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={cn("font-sans antialiased", inter.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
