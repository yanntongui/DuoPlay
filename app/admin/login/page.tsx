import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Administration" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-slate-100 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-6 size-16 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Connexion Admin
          </h1>
          <p className="mt-2 text-slate-600">
            Accédez à la console d&apos;administration DuoPlay
          </p>
        </div>

        <form
          action="/"
          method="POST"
          className="mt-8 space-y-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Mot de passe incorrect
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="admin@duoplay.com"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="admin@duoplay.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Accès réservé au personnel autorisé</p>
          <p className="mt-1">Toutes les actions sont journalisées</p>
        </div>
      </div>
    </div>
  );
}
