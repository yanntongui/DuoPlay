import Link from "next/link";

export const metadata = { title: "Page introuvable" };

/** Erreur de navigation : toujours une action proposée (cf. PRD §20). */
export default function NotFound() {
  return (
    <div
      id="contenu"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-2xl">
        🔍
      </div>
      <h1 className="text-xl font-semibold">Cette page n&apos;existe pas</h1>
      <p className="text-sm text-muted-foreground">
        Le lien est peut-être incomplet, ou la page a été déplacée. Votre partie
        et votre espace restent intacts.
      </p>
      <div className="flex flex-col items-center gap-3 pt-2">
        <Link
          href="/accueil"
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-coral-600"
        >
          Revenir à l&apos;accueil
        </Link>
        <Link href="/explorer" className="text-sm text-primary hover:underline">
          Explorer les univers
        </Link>
      </div>
    </div>
  );
}
