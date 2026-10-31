import { OurSpace } from "@/components/app/our-space";

export const metadata = { title: "Notre espace" };

export default function NotreEspacePage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold">Notre espace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre couple, vos favoris et vos parties, au même endroit.
        </p>
      </section>

      <OurSpace />
    </div>
  );
}
