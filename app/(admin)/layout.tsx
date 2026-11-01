import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 z-30 h-screen border-r border-slate-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center border-b border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-indigo-600" />
              <div>
                <h1 className="text-sm font-bold text-slate-900">DuoPlay</h1>
                <p className="text-xs text-slate-500">Administration</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <a href="/admin" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>📊</span>
              <span>Tableau de bord</span>
            </a>
            <a href="/admin/users" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>👥</span>
              <span>Utilisateurs</span>
            </a>
            <a href="/admin/couples" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>💑</span>
              <span>Couples</span>
            </a>
            <a href="/admin/experiences" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>🎮</span>
              <span>Expériences</span>
            </a>
            <a href="/admin/revenue" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>💰</span>
              <span>Revenus</span>
            </a>
            <a href="/admin/moderation" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>🛡️</span>
              <span>Modération</span>
            </a>
            <a href="/admin/support" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>🎧</span>
              <span>Support</span>
            </a>
            <a href="/admin/analytics" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>📉</span>
              <span>Analytics</span>
            </a>
            <a href="/admin/settings" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>⚙️</span>
              <span>Paramètres</span>
            </a>
            <a href="/admin/audit" className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100">
              <span>📋</span>
              <span>Audit</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Admin</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <div className="size-10 rounded-full bg-indigo-600" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
