import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lexic',
  description: 'A modern wordle clone ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(
        inter.className,
        "min-h-[100dvh] bg-background font-sans antialiased"
      )} suppressHydrationWarning={true}>
        <div className="ambient-background">
          <div className="blob" style={{
            background: 'hsl(var(--accent))',
            left: '60%',
            top: '30%',
            animation: 'float-blob-1 20s infinite',
          }} />
          <div className="blob" style={{
            background: 'hsl(var(--muted))',
            left: '30%',
            bottom: '40%',
            animation: 'float-blob-2 25s infinite',
          }} />
          <div className="blob" style={{
            background: 'hsl(var(--accent))',
            right: '40%',
            top: '60%',
            animation: 'float-blob-1 22s infinite',
          }} />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}