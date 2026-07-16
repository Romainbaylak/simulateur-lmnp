import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

// Clerk dashboard config (User & Authentication → Email, Phone, Username) :
//   - Désactiver "Password"
//   - Activer "Email verification code" (OTP 6 chiffres)
// Sessions → Session lifetime : 30 jours

export const metadata: Metadata = {
  title: "toutlmnp – Simulateur de rentabilité LMNP",
  description: "Simulez votre investissement LMNP : rendement, cash-flow, amortissement. Comparez régime réel vs micro-BIC.",
  keywords: "LMNP, simulateur, rentabilité, régime réel, micro-BIC, investissement immobilier, amortissement",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-in"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        variables: { colorPrimary: "#C95B2A" },
        elements: { socialButtonsRoot: { display: "none" } },
      }}
    >
      <html lang="fr">
        <body className="antialiased" style={{ backgroundColor: "#F5F0E8", color: "#1A1612" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
