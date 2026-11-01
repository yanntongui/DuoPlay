"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Routes publiques (login, 2FA)
const PUBLIC_ROUTES = ["/admin/login", "/admin/2fa"];

export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{
    userId: string;
    role: string;
    permissions: string[];
    canViewSensitive: boolean;
    twoFactorEnabled: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token admin dans localStorage
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        setAdmin({
          userId: "admin_user",
          role: "super_admin",
          permissions: ["*"],
          canViewSensitive: true,
          twoFactorEnabled: false,
        });
      } else {
        setAdmin(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Redirection si pas authentifié et pas sur une route publique
  useEffect(() => {
    if (!admin && !PUBLIC_ROUTES.includes(pathname) && !isLoading) {
      router.replace("/admin/login");
    }
  }, [admin, pathname, isLoading, router]);

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAdmin(null);
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
