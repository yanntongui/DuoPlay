export default function AdminLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-slate-100 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-6 size-16 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Connexion Admin</h1>
          <p className="mt-2 text-slate-600">Accédez à la console d'administration DuoPlay</p>
        </div>
      </div>
    </div>
  );
}
