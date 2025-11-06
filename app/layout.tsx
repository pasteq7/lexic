// layout.tsx
import './globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import ParticlesBackground from '@/components/ui/particles-background';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lexic',
  description: 'A modern wordle clone',
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
        "min-h-[100dvh] bg-background font-sans antialiased relative"
      )} suppressHydrationWarning={true}>
        <ParticlesBackground />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}