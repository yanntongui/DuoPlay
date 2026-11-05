import { ProfilePage } from "@/components/account/profile-page";

export const metadata = { title: "Mon profil" };

export default function ComptePage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérer votre identité, vos préférences de jeu et vos données personnelles.
        </p>
      </section>

      <ProfilePage />
    </div>
  );
}
