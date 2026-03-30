import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { SocialAuthCard } from "@/components/auth/social-auth-card";
import { createPageMetadata, getBreadcrumbJsonLd } from "@/lib/seo";

export const runtime = "edge";

export const metadata: Metadata = createPageMetadata({
  title: "Connexion",
  description: "Page de connexion BeFood pour démarrer votre parcours ou retrouver votre compte.",
  path: "/connexion",
  noIndex: true,
});

export default function ConnexionPage() {
  return (
    <>
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(16,185,129,0.12),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(15,23,42,0.10),transparent_35%)]" />
        <Container className="relative">
          <SocialAuthCard mode="signin" />
        </Container>
      </section>
      <JsonLd
        data={getBreadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Connexion", path: "/connexion" },
        ])}
      />
    </>
  );
}
