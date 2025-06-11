import type { ReactNode } from 'react';
import { Logo } from '@/components/logo';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
        </div>
        <div className="bg-card p-8 rounded-lg shadow-2xl">
          <h1 className="font-headline text-2xl font-bold text-primary mb-2 text-center">{title}</h1>
          <p className="text-muted-foreground mb-6 text-center">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
