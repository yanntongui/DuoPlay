import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogout } from "@/components/admin/logout";

const NAV_ITEMS = [
  { href: "/admin", label: "Tableau de bord", icon: "📊" },
  { href: "/admin/users", label: "Utilisateurs", icon: "👥" },
  { href: "/admin/couples", label: "Couples", icon: "💑" },
  { href: "/admin/experiences", label: "Expériences", icon: "🎮" },
  { href: "/admin/cards", label: "Cartes", icon: "🃏" },
  { href: "/admin/dice", label: "Dés", icon: "🎲" },
  { href: "/admin/journeys", label: "Parcours", icon: "🛤️" },
  { href: "/admin/finance", label: "Finance", icon: "💰" },
  { href: "/admin/support", label: "Support", icon: "🎧" },
  { href: "/admin/moderation", label: "Modération", icon: "🛡️" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/segments", label: "Segments", icon: "👥" },
  { href: "/admin/campaigns", label: "Campagnes", icon: "📣" },
  { href: "/admin/flags", label: "Feature Flags", icon: "🚩" },
  { href: "/admin/gdpr", label: "RGPD", icon: "🔒" },
  { href: "/admin/audit", label: "Audit", icon: "📋" },
  { href: "/admin/monitoring", label: "Monitoring", icon: "📟" },
  { href: "/admin/settings", label: "Paramètres", icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-slate-900">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-700 p-4">
          <h2 className="text-lg font-bold text-white">DuoPlay Admin</h2>
          <p className="text-xs text-slate-400">Administration</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-700 p-4">
          <AdminLogout />
        </div>
      </div>
    </aside>
  );
}
