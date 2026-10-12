import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "MenuZap — Catálogo e cardápio digital com pedido no WhatsApp", template: "%s" },
  description: "Crie seu catálogo ou cardápio digital em minutos e receba pedidos organizados no WhatsApp.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#EAB308" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={font.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
