import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { login } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/session";

export const metadata = { title: "Administration" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-graphite-900 px-5">
      <Logo className="mb-8 [&_span]:text-white" />

      <form
        action={login}
        className="w-full max-w-sm rounded-xl border border-white/10 bg-graphite-800 p-6"
      >
        <h1 className="mb-1 text-lg font-semibold text-white">Administration</h1>
        <p className="mb-5 text-sm text-white/60">
          Accès réservé à l&apos;équipe DuoPlay.
        </p>

        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-white/80"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mb-4 h-11 w-full rounded-lg border border-white/15 bg-graphite-900 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
        />

        {error && (
          <p className="mb-4 rounded-lg bg-coral-600/20 px-3 py-2 text-sm text-coral-300">
            Mot de passe incorrect.
          </p>
        )}

        <button
          type="submit"
          className="h-11 w-full rounded-full bg-coral-500 text-sm font-medium text-white transition-colors hover:bg-coral-600"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
