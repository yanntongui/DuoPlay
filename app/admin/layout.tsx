import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/shell";
import { isAdminConsoleEnabled } from "@/lib/admin/enabled";
import "./admin.css";

export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

/**
 * Console interne. Tant que l'authentification n'est pas réelle, elle est
 * fermée en production (voir `lib/admin/enabled.ts`) : on renvoie un 404,
 * jamais un écran de connexion factice.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminConsoleEnabled()) notFound();

  return <AdminShell>{children}</AdminShell>;
}
