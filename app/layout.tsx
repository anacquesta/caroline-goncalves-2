import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caroline Gonçalves — Jornalismo, Comunicação e Fotografia",
  description: "Portfólio editorial de Caroline Gonçalves, jornalista, comunicadora e fotógrafa em Brasília.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
