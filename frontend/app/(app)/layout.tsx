'use client';

import { Header } from '@/components/ui/Header';
import { BottomNav } from '@/components/ui/BottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen relative pb-20 lg:pb-0 overflow-hidden bg-brand-dark">
        {/* Background elegante e sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark to-brand-primary/5" />

        {/* Subtle glow effects */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-light/5 rounded-full blur-3xl" />

        {/* Waveform background - very subtle */}
        <div className="absolute inset-0 opacity-5">
          <svg className="absolute top-1/3 left-0 w-full" height="150" preserveAspectRatio="none">
            <path
              d="M0,75 Q200,50 400,75 T800,75 T1200,75 T1600,75 T2000,75"
              fill="none"
              stroke="#7435FD"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Top Navigation (desktop only) */}
        <Header />

        {/* Main content */}
        <main className="relative z-10 container mx-auto px-6 lg:px-8 py-8 max-w-7xl">
          {children}
        </main>

        {/* Bottom Navigation (mobile only) */}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
