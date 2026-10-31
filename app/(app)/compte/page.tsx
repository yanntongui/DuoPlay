import { AccountPanel } from "@/components/account/account-panel";

export const metadata = { title: "Mon profil" };

export default function ComptePage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Un compte léger, sans mot de passe, pour que « Notre espace » vous
          suive d&apos;un appareil à l&apos;autre. Jouer sans compte reste
          toujours possible.
        </p>
      </section>

      <AccountPanel />
    </div>
  );
}
