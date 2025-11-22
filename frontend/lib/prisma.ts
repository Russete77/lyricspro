import { PrismaClient } from '@prisma/client';

// Detectar se está rodando no Electron
const isElectron = typeof process !== 'undefined' && process.env.ELECTRON === 'true';

// PrismaClient Singleton (evita múltiplas instâncias em dev)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configurar datasource baseado no ambiente
const datasourceUrl = isElectron
  ? `file:${process.env.ELECTRON_DB_PATH || './lyricspro.db'}`
  : process.env.DATABASE_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: datasourceUrl
      ? {
          db: {
            url: datasourceUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
