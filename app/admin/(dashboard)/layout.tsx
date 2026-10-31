import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { logout } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/session";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/experiences", label: "Expériences" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/parcours", label: "Parcours" },
  { href: "/admin/reports", label: "Modération" },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-ivory-100">
      <header className="border-b border-border bg-graphite-900">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <Logo showWordmark={false} />
            <span className="text-sm font-medium text-white/80">
              Administration
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
            >
              Déconnexion
            </button>
          </form>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="contenu" className="mx-auto w-full max-w-6xl px-5 py-8">
        {children}
      </main>
    </div>
  );
}
