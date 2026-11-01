"use client";

export function AdminLogout() {
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
    >
      <span>🔓</span>
      <span>Déconnexion</span>
    </button>
  );
}
