import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Hors ligne" };

/** Écran de repli servi par le service worker quand le réseau est absent (§16.2). */
export default function OfflinePage() {
  return (
    <div
      id="contenu"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="size-6" />
      </div>
      <h1 className="text-xl font-semibold">Pas de connexion</h1>
      <p className="text-sm text-muted-foreground">
        DuoPlay a besoin du réseau pour synchroniser vos réponses à deux. Les
        pages déjà consultées restent accessibles, et votre partie reprendra où
        vous l&apos;avez laissée.
      </p>
      <div className="flex flex-col items-center gap-3 pt-2">
        <Link
          href="/accueil"
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-coral-600"
        >
          Réessayer
        </Link>
        <Link href="/explorer" className="text-sm text-primary hover:underline">
          Explorer les univers
        </Link>
      </div>
    </div>
  );
}
