'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-primary/10 to-brand-primary/5" />

        {/* Waveform decorative background - elegant and subtle */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <svg className="absolute top-1/4 left-0 w-full" height="200" preserveAspectRatio="none">
            <path
              d="M0,100 Q150,40 300,100 T600,100 T900,100 T1200,100 T1500,100 T1800,100"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              className="animate-float"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7435FD" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#C381E7" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7435FD" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute bottom-1/4 right-0 w-full" height="200" preserveAspectRatio="none">
            <path
              d="M0,100 Q150,140 300,100 T600,100 T900,100 T1200,100 T1500,100 T1800,100"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="2"
              className="animate-float"
              style={{ animationDelay: '1s' }}
            />
            <defs>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C381E7" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#7435FD" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#C381E7" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Glow effects - subtle */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-brand-light/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-8 py-32">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Badge - subtle and elegant */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/80 text-sm font-medium">
              <svg className="w-4 h-4 text-brand-light" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              IA que entende música
            </div>

            {/* Title - clean and professional */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Unlock Your Voice's{' '}
              <span className="bg-gradient-to-r from-brand-primary via-brand-light to-brand-primary bg-clip-text text-transparent">
                Potential
              </span>
            </h1>

            {/* Description - elegant and readable */}
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Transforme áudio em letras profissionalmente transcritas com tecnologia de IA de última geração. Detecção automática de estrutura musical.
            </p>

            {/* CTA Buttons - professional size */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/upload">
                <Button
                  variant="glass"
                  className="min-w-[200px] h-14 text-base font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white border-0 hover:shadow-glow transition-all duration-300"
                >
                  Começar Agora
                </Button>
              </Link>
              <Link href="/library">
                <Button
                  variant="outline"
                  className="min-w-[200px] h-14 text-base font-semibold bg-white/5 backdrop-blur-xl border-white/20 text-white hover:bg-white/10 transition-all duration-300"
                >
                  Ver Biblioteca
                </Button>
              </Link>
            </div>

            {/* Features - clean cards with subtle effects */}
            <div className="grid sm:grid-cols-3 gap-6 pt-16">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: 'Rápido',
                  desc: 'Transcrição em minutos'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: 'Preciso',
                  desc: 'IA GPT-4o + Whisper'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: 'Inteligente',
                  desc: 'Detecta estrutura musical'
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-brand-primary/30 transition-all duration-500 cursor-pointer group"
                  padding="lg"
                >
                  <div className="text-brand-light mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator - subtle */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="animate-float">
            <svg
              className="w-5 h-5 text-white/40"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-brand-dark/95 border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-white/60">
              Três passos simples para ter suas letras transcritas profissionalmente
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'Faça Upload',
                desc: 'Envie seu arquivo de áudio ou vídeo em qualquer formato',
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'IA Processa',
                desc: 'Nossa IA transcreve e detecta automaticamente a estrutura musical',
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Pronto!',
                desc: 'Baixe em múltiplos formatos e compartilhe',
                icon: (
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-brand-primary/30 transition-all duration-500">
                  {/* Step number */}
                  <div className="text-7xl font-bold text-brand-primary/20 mb-4 leading-none">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand-primary/10 text-brand-light mb-6 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </div>

                {/* Connection line (except for last item) */}
                {item.step !== '03' && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-brand-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-light relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 left-0 w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,150 Q200,50 400,150 T800,150 T1200,150 T1600,150"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M0,250 Q200,350 400,250 T800,250 T1200,250 T1600,250"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>

        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Junte-se a centenas de músicos que já usam LyricsPro para transcrever suas letras com qualidade profissional
          </p>
          <Link href="/upload">
            <Button
              variant="glass"
              className="min-w-[220px] h-14 text-base font-semibold bg-white hover:bg-white/90 text-brand-primary border-0 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Experimentar Grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark border-t border-white/5 py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-brand-primary to-brand-light bg-clip-text text-transparent">
                LyricsPro
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Transcrição inteligente de letras de música com IA de última geração
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Produto</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><Link href="/upload" className="hover:text-white transition-colors">Upload</Link></li>
                <li><Link href="/library" className="hover:text-white transition-colors">Biblioteca</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Perfil</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Suporte</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-3 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <p>© 2025 LyricsPro. Todos os direitos reservados.</p>
            <p>Powered by Next.js + FastAPI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
