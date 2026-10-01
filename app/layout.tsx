import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
const sans = localFont({
  src: "../public/fonts/font-5.woff2",
  variable: "--font-interface",
  weight: "400 700",
  display: "swap",
  fallback: ["Arial"],
});
const editorial = localFont({
  src: [
    {
      path: "../public/fonts/font-8.woff2",
      style: "normal",
      weight: "400 600",
    },
    {
      path: "../public/fonts/font-11.woff2",
      style: "italic",
      weight: "400 500",
    },
  ],
  variable: "--font-editorial",
  display: "swap",
  fallback: ["Georgia"],
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173",
  ),
  title: "Carol Gonzaga — Jornalismo, comunicação e fotografia",
  description:
    "Carol Gonzaga (Caroline Gonçalves), jornalista em Brasília. Reportagem, comunicação estratégica, conteúdo e fotografia.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Carol Gonzaga — Jornalismo, comunicação e fotografia",
    description: "Jornalismo · Comunicação · Fotografia",
    locale: "pt_BR",
    type: "website",
    images: ["/images/caroline-principal.png"],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${editorial.variable}`}>
      <body>{children}</body>
    </html>
  );
}
