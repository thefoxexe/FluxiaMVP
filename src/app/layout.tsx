import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fluxia – AI Business OS",
  description:
    "Centralisez emails, devis, clients, factures, trésorerie et automatisations dans une seule plateforme alimentée par l'IA.",
  keywords: ["CRM", "facturation", "devis", "IA", "PME", "Suisse", "business", "automatisation"],
  authors: [{ name: "Fluxia" }],
  openGraph: {
    title: "Fluxia – Votre entreprise pilotée par l'IA",
    description: "Le premier système d'exploitation IA pour PME européennes.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
