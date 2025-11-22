'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importar Clerk components dinamicamente apenas no cliente
const UserButton = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.UserButton),
  { ssr: false }
);

const SignedIn = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.SignedIn),
  { ssr: false }
);

const SignedOut = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.SignedOut),
  { ssr: false }
);

const SignInButton = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.SignInButton),
  { ssr: false }
);

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/upload', label: 'Upload' },
  { href: '/library', label: 'Biblioteca' },
  { href: '/processing', label: 'Processando' },
  { href: '/settings', label: 'Configurações' },
];

export function Header() {
  const pathname = usePathname();
  const [isElectron, setIsElectron] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsElectron(typeof window !== 'undefined' && (window as any).electron?.isElectron);
  }, []);

  return (
    <header className="sticky top-0 z-50 hidden lg:block bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-light bg-clip-text text-transparent">
              LyricsPro
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-5 py-2.5 rounded-xl font-medium transition-all duration-300',
                    isActive
                      ? 'bg-brand-primary/20 text-white border border-brand-primary/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User area */}
          {isClient && !isElectron && (
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-5 py-2.5 rounded-xl font-medium text-white bg-brand-primary hover:bg-brand-primary/90 transition-all duration-300">
                    Entrar
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </SignedIn>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
