import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="ml-64">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Administration</h1>
              <p className="text-sm text-slate-500">Gérez la plateforme DuoPlay</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Super Admin</span>
              <div className="size-8 rounded-full bg-slate-900" />
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
