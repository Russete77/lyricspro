import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LyricsPro - Transcrição Inteligente de Letras",
  description: "Transforme áudio em letras profissionalmente transcritas com detecção automática de estrutura musical",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Detectar se está rodando no Electron (modo offline)
  const isElectron = process.env.ELECTRON === 'true';

  if (isElectron) {
    // Modo Electron: sem autenticação
    return (
      <html lang="pt-BR" className={`${manrope.variable} ${inter.variable}`}>
        <body className="font-sans antialiased">
          {children}
        </body>
      </html>
    );
  }

  // Modo Web: com autenticação Clerk
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${manrope.variable} ${inter.variable}`}>
        <body className="font-sans antialiased">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
