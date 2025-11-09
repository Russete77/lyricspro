'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';

export default function ProfilePage() {
  // Mock data
  const user = {
    name: 'Erick',
    email: 'erick@example.com',
    plan: 'Free',
    credits: 7,
    maxCredits: 10,
    songsTranscribed: 3,
    totalDuration: 920, // segundos
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Meu Perfil
        </h1>
        <p className="text-white/60">
          Gerencie sua conta e configurações
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-light flex items-center justify-center text-white text-2xl font-bold shadow-glow">
              {user.name[0]}
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
            <Badge variant="primary" className="bg-brand-primary/20 text-white border border-brand-primary/30">
              {user.plan}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Credits */}
      <Card>
        <CardHeader>
          <CardTitle>Créditos de Transcrição</CardTitle>
          <CardDescription>
            Você tem {user.credits} de {user.maxCredits} créditos disponíveis este mês
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={(user.credits / user.maxCredits) * 100} gradient />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <span className="text-white/60">
              Recarrega automaticamente todo mês no plano {user.plan}
            </span>
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10 w-full sm:w-auto">
              Comprar Mais Créditos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="hover:bg-white/10 transition-all duration-300">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-light bg-clip-text text-transparent mb-3">
              {user.songsTranscribed}
            </div>
            <p className="text-sm text-white/60 font-medium">
              Músicas Transcritas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:bg-white/10 transition-all duration-300">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-brand-primary to-brand-light bg-clip-text text-transparent mb-3">
              {formatDuration(user.totalDuration)}
            </div>
            <p className="text-sm text-white/60 font-medium">
              Tempo Total de Áudio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>Escolha o plano ideal para você</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: 'R$ 0', credits: 10, features: ['10 créditos/mês', 'Suporte básico', 'Formatos básicos'] },
              { name: 'Pro', price: 'R$ 29', credits: 50, features: ['50 créditos/mês', 'Suporte prioritário', 'Exportação PDF', 'Editor avançado'] },
              { name: 'Enterprise', price: 'R$ 99', credits: 200, features: ['200 créditos/mês', 'Suporte 24/7', 'API access', 'Recursos ilimitados'] },
            ].map((plan) => (
              <Card
                key={plan.name}
                variant={plan.name === user.plan ? 'gradient' : 'default'}
                className={`text-center transition-all duration-300 ${plan.name === user.plan ? 'shadow-glow scale-105' : 'hover:scale-105 hover:border-brand-primary/30'}`}
              >
                <CardHeader>
                  <CardTitle className={`text-xl mb-3 ${plan.name === user.plan ? 'text-white' : 'text-white'}`}>
                    {plan.name}
                  </CardTitle>
                  <div className={`text-4xl font-bold mb-1 ${plan.name === user.plan ? 'text-white' : 'text-brand-light'}`}>
                    {plan.price}
                  </div>
                  <CardDescription className={plan.name === user.plan ? 'text-white/70' : 'text-white/50'}>
                    por mês
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className={`text-sm flex items-center gap-2 justify-center ${plan.name === user.plan ? 'text-white/90' : 'text-white/70'}`}>
                        <svg className="w-4 h-4 text-brand-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  {plan.name === user.plan ? (
                    <Badge variant="success" className="bg-white/20 text-white border border-white/30">Plano Atual</Badge>
                  ) : (
                    <Button variant={plan.name === 'Pro' ? 'gradient' : 'outline'} size="sm" fullWidth className={plan.name !== 'Pro' ? 'bg-white/5 border-white/10 text-white/80 hover:text-white hover:bg-white/10' : ''}>
                      Escolher Plano
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="outline" className="border-error/30 bg-error/5">
        <CardHeader>
          <CardTitle className="text-error flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Zona de Perigo
          </CardTitle>
          <CardDescription>Ações irreversíveis - use com cautela</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button variant="error" size="sm" className="w-full sm:w-auto">
            Deletar Todas as Músicas
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto border-error/30 text-error/80 hover:text-error hover:bg-error/10">
            Deletar Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
