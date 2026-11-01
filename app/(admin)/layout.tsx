"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isAuthenticated, router]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 fixed left-0 top-0 h-screen border-r border-slate-200 bg-white p-4">
        <h2 className="font-bold text-slate-900">DuoPlay Admin</h2>
        <nav className="mt-4 space-y-2">
          <a href="/admin" className="block p-2 rounded hover:bg-slate-100">Tableau de bord</a>
          <a href="/admin/users" className="block p-2 rounded hover:bg-slate-100">Utilisateurs</a>
          <a href="/admin/couples" className="block p-2 rounded hover:bg-slate-100">Couples</a>
          <a href="/admin/experiences" className="block p-2 rounded hover:bg-slate-100">Expériences</a>
          <a href="/admin/revenue" className="block p-2 rounded hover:bg-slate-100">Revenus</a>
          <a href="/admin/moderation" className="block p-2 rounded hover:bg-slate-100">Modération</a>
          <a href="/admin/analytics" className="block p-2 rounded hover:bg-slate-100">Analytics</a>
          <a href="/admin/settings" className="block p-2 rounded hover:bg-slate-100">Paramètres</a>
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-6">
        <header className="flex justify-end mb-6">
          <button onClick={logout} className="p-2 rounded hover:bg-slate-100">Déconnexion</button>
        </header>
        {children}
      </main>
    </div>
  );
}
