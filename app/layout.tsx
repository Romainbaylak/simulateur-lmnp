import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMNP Simulator – Calculez votre rentabilité LMNP en 2 minutes",
  description: "Simulez votre investissement LMNP : rendement, cash-flow, impôts. Comparez régime réel vs micro-BIC avec la réforme fiscale 2025.",
  keywords: "LMNP, simulateur, rentabilité, régime réel, micro-BIC, investissement immobilier, amortissement",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
