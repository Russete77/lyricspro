import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rotas públicas que não precisam de autenticação
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
]);

export default clerkMiddleware(
  async (auth, request) => {
    // Proteger rotas que não são públicas
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    // Configurar CSP para permitir uploads ao R2 e blob URLs para áudio
    contentSecurityPolicy: {
      directives: {
        'connect-src': [
          "'self'",
          'http://localhost:*',
          'ws://localhost:*',
          'https://clerk.hrxeventos.com.br',
          'https://*.clerk.accounts.dev',
          'https://api.clerk.com',
          'https://*.supabase.co',
          'wss://*.supabase.co',
          'https://*.r2.cloudflarestorage.com', // Cloudflare R2 uploads
          'https://challenges.cloudflare.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://viacep.com.br',
          'https://*.sentry.io',
          'https://va.vercel-scripts.com',
        ],
        'media-src': [
          "'self'",
          'blob:',
          'data:',
        ],
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https:',
        ],
      },
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
