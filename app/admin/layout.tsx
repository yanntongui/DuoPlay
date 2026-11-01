export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 fixed left-0 top-0 h-screen border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">DuoPlay Admin</h2>
        </div>
        <nav className="p-4 space-y-1">
          <a href="/admin" className="block rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
            Tableau de bord
          </a>
          <a href="/admin/users" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Utilisateurs
          </a>
          <a href="/admin/couples" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Couples
          </a>
          <a href="/admin/experiences" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Expériences
          </a>
          <a href="/admin/revenue" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Revenus
          </a>
          <a href="/admin/moderation" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Modération
          </a>
          <a href="/admin/analytics" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Analytics
          </a>
          <a href="/admin/settings" className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
            Paramètres
          </a>
        </nav>
      </aside>
      <main className="flex-1 ml-64">
        <header className="border-b border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Administration</span>
            <button className="text-sm text-slate-600 hover:text-slate-900">Déconnexion</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
