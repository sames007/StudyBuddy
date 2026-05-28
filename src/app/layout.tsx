import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { APP_NAME } from '@/lib/brand';
import './globals.css';

export const metadata: Metadata = {
  title: `${APP_NAME}: Your AI-Powered Learning Partner`,
  description: 'An intelligent, all-in-one study assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
