import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "VitrineZap — Catálogo digital com pedido no WhatsApp", template: "%s" },
  description: "Crie seu catálogo ou cardápio digital em minutos e receba pedidos organizados no WhatsApp.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#16a34a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
