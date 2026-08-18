import Logo from "@/components/Logo";
import Link from "next/link";
import type { Metadata } from "next";
import HeaderAuth from "@/components/HeaderAuth";
import MobileHeader from "@/components/MobileHeader";

export const metadata: Metadata = {
  title: "Informations légales – toutlmnp",
  description: "Mentions légales, politique de confidentialité et conditions générales de vente de ToutLMNP.",
};

const DIVIDER = <hr style={{ border: "none", borderTop: "1px solid rgba(26,22,18,0.1)", margin: "48px 0" }} />;

const SectionTitle = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="text-2xl" style={{ fontWeight: 500, color: "#4E1F12", letterSpacing: "-0.02em", scrollMarginTop: 80, marginBottom: 28 }}>
    {children}
  </h2>
);

const SubTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-base mt-7 mb-2" style={{ fontWeight: 600, color: "#1A1612" }}>{children}</h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm leading-relaxed" style={{ color: "rgba(26,22,18,0.72)", marginBottom: 8 }}>{children}</p>
);

const UL = ({ items }: { items: string[] }) => (
  <ul className="text-sm leading-relaxed space-y-1 pl-4 mb-2" style={{ color: "rgba(26,22,18,0.72)", listStyleType: "disc" }}>
    {items.map(i => <li key={i}>{i}</li>)}
  </ul>
);

export default function LegalPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#4E1F12", borderBottom: "2px solid rgba(245,240,232,0.18)" }} className="sticky top-0 z-50">
        <div className="hidden md:flex max-w-6xl mx-auto px-4 py-3 items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <nav className="flex items-center gap-6 text-base font-normal" style={{ color: "#F5F0E8" }}>
            <Link href="/comment-ca-marche" className="hover:opacity-80 transition-opacity">LMNP</Link>
            <Link href="/blog" className="hover:opacity-80 transition-opacity">Articles</Link>
            <Link href="/tarifs" className="hover:opacity-80 transition-opacity">Abonnements</Link>
          </nav>
          <div className="flex items-center gap-2">
            <HeaderAuth dark={true} />
            <a href="/#simulateur" className="text-sm font-medium px-4 py-2 transition-opacity hover:opacity-[0.88]"
              style={{ backgroundColor: "#C95B2A", color: "#F5F0E8", borderRadius: 6 }}>
              Simuler maintenant
            </a>
          </div>
        </div>
        <MobileHeader />
      </header>

      {/* Intro + ancres */}
      <div className="py-10 px-4 text-center" style={{ borderBottom: "1px solid rgba(26,22,18,0.07)" }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="font-light mb-6" style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", color: "#4E1F12", letterSpacing: "-0.025em" }}>
            Informations légales
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Mentions légales", anchor: "#mentions" },
              { label: "Confidentialité", anchor: "#confidentialite" },
              { label: "CGV", anchor: "#cgv" },
            ].map(({ label, anchor }) => (
              <a key={anchor} href={anchor}
                className="text-sm font-medium px-4 py-2 rounded-md transition-opacity hover:opacity-80"
                style={{ background: "rgba(201,91,42,0.08)", color: "#C95B2A", border: "1px solid rgba(201,91,42,0.2)" }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* ── Mentions légales ── */}
        <SectionTitle id="mentions">Mentions légales</SectionTitle>

        <SubTitle>Éditeur du site</SubTitle>
        <P>Société ToutLMNP — en cours de création</P>
        <P>1 quai de la Corse, 75004 Paris</P>
        <P>Email : <a href="mailto:contact@toutlmnp.fr" style={{ color: "#C95B2A" }}>contact@toutlmnp.fr</a></P>
        <P>SIRET : en cours d&apos;immatriculation</P>

        <SubTitle>Directeur de la publication</SubTitle>
        <P>ToutLMNP</P>

        <SubTitle>Hébergement</SubTitle>
        <P>Vercel Inc.</P>
        <P>440 N Barranca Ave #4133, Covina, CA 91723, USA</P>
        <P>vercel.com</P>

        {DIVIDER}

        {/* ── Politique de confidentialité ── */}
        <SectionTitle id="confidentialite">Politique de confidentialité</SectionTitle>
        <P>Dernière mise à jour : août 2026</P>

        <SubTitle>Qui sommes-nous ?</SubTitle>
        <P>ToutLMNP est un simulateur de rentabilité immobilière accessible sur toutlmnp.fr — <a href="mailto:contact@toutlmnp.fr" style={{ color: "#C95B2A" }}>contact@toutlmnp.fr</a></P>

        <SubTitle>Quelles données collectons-nous ?</SubTitle>
        <P>Lors de la création de ton compte :</P>
        <UL items={["Adresse email (via Clerk)", "Date de création du compte"]} />
        <P>Lors d&apos;un paiement :</P>
        <UL items={[
          "Email de facturation (via Stripe)",
          "Les données bancaires sont traitées directement par Stripe — elles ne transitent jamais par nos serveurs",
        ]} />
        <P>Lors de l&apos;utilisation du simulateur :</P>
        <UL items={[
          "Les données saisies (prix du bien, loyer, etc.)",
          "Si tu es connecté et abonné, tes simulations peuvent être sauvegardées",
        ]} />

        <SubTitle>Pourquoi collectons-nous ces données ?</SubTitle>
        <UL items={[
          "Email → gérer ton compte et envoyer les confirmations",
          "Simulations → te permettre de les retrouver",
          "Paiement → traiter tes achats et abonnements",
        ]} />

        <SubTitle>Combien de temps conservons-nous tes données ?</SubTitle>
        <UL items={[
          "Données de compte → tant que ton compte est actif",
          "Simulations sauvegardées → tant que ton compte est actif",
          "Données de paiement → 10 ans (obligation légale)",
        ]} />

        <SubTitle>Cookies</SubTitle>
        <P>ToutLMNP utilise uniquement des cookies strictement nécessaires au fonctionnement du site — authentification (Clerk) et sécurité des paiements (Stripe). Aucun cookie publicitaire ou de tracking n&apos;est utilisé.</P>

        <SubTitle>Tes droits (RGPD)</SubTitle>
        <P>Tu disposes des droits d&apos;accès, rectification, effacement et portabilité de tes données. Pour exercer ces droits : <a href="mailto:contact@toutlmnp.fr" style={{ color: "#C95B2A" }}>contact@toutlmnp.fr</a> — réponse sous 30 jours.</P>

        <SubTitle>Sous-traitants</SubTitle>
        <UL items={[
          "Clerk (authentification) — clerk.com",
          "Stripe (paiements) — stripe.com",
          "Supabase (base de données) — supabase.com",
          "Vercel (hébergement) — vercel.com",
        ]} />

        <SubTitle>Autorité de contrôle</SubTitle>
        <P>En cas de réclamation : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "#C95B2A" }}>cnil.fr</a></P>

        {DIVIDER}

        {/* ── CGV ── */}
        <SectionTitle id="cgv">Conditions Générales de Vente</SectionTitle>
        <P>Dernière mise à jour : août 2026</P>

        <SubTitle>1. Éditeur</SubTitle>
        <P>ToutLMNP — en cours de création</P>
        <P>1 quai de la Corse, 75004 Paris</P>
        <P><a href="mailto:contact@toutlmnp.fr" style={{ color: "#C95B2A" }}>contact@toutlmnp.fr</a></P>

        <SubTitle>2. Services proposés</SubTitle>
        <UL items={[
          "Rapport à l'unité — 1,99 € : rapport complet (amortissement + PDF) pour une simulation. Paiement unique, non récurrent.",
          "Offre Investisseur — 7,99 €/mois : simulations illimitées, tableau d'amortissement ajustable, 3 exports PDF/semaine, sauvegarde jusqu'à 10 simulations.",
          "Offre Pro — 24,99 €/mois : tout l'Investisseur + exports illimités + multi-biens + sauvegarde illimitée.",
          "Offre Pro+ — 149,99 €/mois : accès professionnel multi-clients.",
        ]} />

        <SubTitle>3. Prix</SubTitle>
        <P>Tous les prix sont en euros TTC. Les tarifs en vigueur au moment de la commande s&apos;appliquent.</P>

        <SubTitle>4. Paiement</SubTitle>
        <P>Paiements sécurisés via Stripe. Cartes bancaires et Apple Pay acceptés. Aucune donnée bancaire stockée sur nos serveurs.</P>

        <SubTitle>5. Droit de rétractation</SubTitle>
        <P>Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique pas aux contenus numériques fournis immédiatement (rapport PDF, accès instantané).</P>
        <P>Pour les abonnements : annulation possible à tout moment depuis &ldquo;Mon compte&rdquo;. L&apos;accès reste actif jusqu&apos;à la fin de la période en cours.</P>

        <SubTitle>6. Résiliation</SubTitle>
        <P>Résiliation possible à tout moment depuis &ldquo;Mon compte&rdquo;. Aucun remboursement pour la période en cours. Effet à la fin du mois en cours.</P>

        <SubTitle>7. Limitation de responsabilité</SubTitle>
        <P>Les simulations de ToutLMNP sont fournies à titre indicatif uniquement. Elles ne constituent pas un conseil fiscal, juridique ou financier. ToutLMNP ne peut être tenu responsable des décisions d&apos;investissement prises sur cette base. Consulte un professionnel qualifié pour toute décision importante.</P>

        <SubTitle>8. Propriété intellectuelle</SubTitle>
        <P>Tout le contenu de ToutLMNP est protégé par le droit d&apos;auteur. Reproduction interdite sans autorisation écrite.</P>

        <SubTitle>9. Droit applicable</SubTitle>
        <P>Droit français. Tribunaux français compétents.</P>

        <SubTitle>10. Contact</SubTitle>
        <P><a href="mailto:contact@toutlmnp.fr" style={{ color: "#C95B2A" }}>contact@toutlmnp.fr</a></P>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "0.5px solid rgba(26,22,18,0.08)" }} className="py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/"><Logo /></Link>
          <nav className="hidden md:flex flex-col items-center gap-2 text-xs" style={{ color: "rgba(26,22,18,0.4)" }}>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/comment-ca-marche" className="hover:opacity-80">LMNP</Link>
              <Link href="/blog" className="hover:opacity-80">Articles</Link>
              <Link href="/tarifs" className="hover:opacity-80">Abonnements</Link>
              <Link href="/contact" className="hover:opacity-80">Contact</Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4" style={{ color: "rgba(26,22,18,0.3)" }}>
              <Link href="/legal#mentions" className="hover:opacity-80">Mentions légales</Link>
              <Link href="/legal#confidentialite" className="hover:opacity-80">Confidentialité</Link>
              <Link href="/legal#cgv" className="hover:opacity-80">CGV</Link>
            </div>
          </nav>
          <p className="text-xs" style={{ color: "rgba(26,22,18,0.35)" }}>© 2026 toutlmnp</p>
        </div>
      </footer>
    </main>
  );
}
