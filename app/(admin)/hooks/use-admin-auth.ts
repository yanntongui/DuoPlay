"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Routes publiques (login, 2FA)
const PUBLIC_ROUTES = ["/admin/login", "/admin/2fa"];

export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const admin = useQuery(api.admin.adminMe);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (admin === undefined) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      // Redirection si pas authentifié et pas sur une route publique
      if (!admin && !PUBLIC_ROUTES.includes(pathname)) {
        router.replace("/admin/login");
      }
    }
  }, [admin, pathname, router]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const hasPermission = (perm: string) => {
    return admin?.permissions?.includes(perm) ?? false;
  };

  const hasAnyPermission = (perms: string[]) => {
    return perms.some((p) => admin?.permissions?.includes(p));
  };

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    hasPermission,
    hasAnyPermission,
    logout,
  };
}
