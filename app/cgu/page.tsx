import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Conditions générales d'utilisation" };

export default function CguPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10">
      <Link href="/" aria-label="DuoPlay">
        <Logo />
      </Link>

      <h1 className="mt-8 text-3xl font-semibold">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Dernière mise à jour : à compléter.
      </p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold">Objet du service</h2>
          <p>
            DuoPlay propose des jeux, des défis et des expériences à vivre à
            deux. Le service ne fournit aucun conseil thérapeutique ou
            relationnel professionnel.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Utilisation</h2>
          <p>
            Vous vous engagez à utiliser DuoPlay de manière respectueuse.
            Aucune activité n&apos;est imposée : chaque question peut être
            passée sans justification.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Âge minimum</h2>
          <p>
            Le service est réservé aux personnes majeures. L&apos;âge minimum
            reste à confirmer.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <p className="text-muted-foreground">
            ⚠️ Document provisoire — conditions à rédiger et faire valider
            juridiquement avant mise en production.
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
