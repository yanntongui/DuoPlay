import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10">
      <Link href="/" aria-label="DuoPlay">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-semibold">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dernière mise à jour : à compléter.
      </p>

      <div className="prose-sm mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold">Données collectées</h2>
          <p>
            DuoPlay traite des informations de compte (prénom, contact
            facultatif), des réponses de jeu et des données d&apos;usage
            destinées à améliorer le service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">
            Confidentialité des réponses
          </h2>
          <p>
            Les réponses d&apos;un joueur ne sont jamais lisibles par
            l&apos;autre avant la révélation. Cette garantie est appliquée côté
            serveur, et non seulement dans l&apos;interface.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Conservation et suppression</h2>
          <p>
            Les sessions temporaires expirées sont purgées. Chaque utilisateur
            peut demander la suppression de son compte et de ses données.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <p className="text-muted-foreground">
            ⚠️ Document provisoire — texte juridique à rédiger et adapter à la
            réglementation locale (Code du numérique béninois / APDP) avant
            toute mise en production.
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Retour
      </Link>
    </div>
  );
}
