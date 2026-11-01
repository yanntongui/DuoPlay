"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier la session admin
    const checkSession = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin/login");
      } else {
        setIsLoggedIn(true);
      }
      setIsLoading(false);
    };
    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-600">Chargement de la console...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } fixed left-0 top-0 z-30 h-screen border-r border-slate-200 bg-white transition-all duration-300`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center border-b border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-indigo-600" />
              {sidebarOpen && (
                <div>
                  <h1 className="text-sm font-bold text-slate-900">DuoPlay</h1>
                  <p className="text-xs text-slate-500">Administration</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <NavItem href="/admin" icon="📊" label="Tableau de bord" open={sidebarOpen} />
            <NavItem href="/admin/users" icon="👥" label="Utilisateurs" open={sidebarOpen} />
            <NavItem href="/admin/couples" icon="💑" label="Couples" open={sidebarOpen} />
            <NavItem href="/admin/experiences" icon="🎮" label="Expériences" open={sidebarOpen} />
            <NavItem href="/admin/revenue" icon="💰" label="Revenus" open={sidebarOpen} />
            <NavItem href="/admin/finance" icon="📈" label="Finance" open={sidebarOpen} />
            <NavItem href="/admin/moderation" icon="🛡️" label="Modération" open={sidebarOpen} />
            <NavItem href="/admin/support" icon="🎧" label="Support" open={sidebarOpen} />
            <NavItem href="/admin/analytics" icon="📉" label="Analytics" open={sidebarOpen} />
            <NavItem href="/admin/settings" icon="⚙️" label="Paramètres" open={sidebarOpen} />
            <NavItem href="/admin/audit" icon="📋" label="Audit" open={sidebarOpen} />
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4">
            <button
              onClick={() => {
                localStorage.removeItem("admin_token");
                router.push("/admin/login");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              <span>🔓</span>
              {sidebarOpen && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Top Bar */}
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <span className="text-xl">{sidebarOpen ? "◀" : "▶"}</span>
            </button>

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

function NavItem({
  href,
  icon,
  label,
  open,
}: {
  href: string;
  icon: string;
  label: string;
  open: boolean;
}) {
  const router = useRouter();
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-100"
    >
      <span>{icon}</span>
      {open && <span>{label}</span>}
    </a>
  );
}
