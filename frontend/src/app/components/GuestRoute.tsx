"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * GuestRoute component - untuk halaman yang hanya bisa diakses oleh user yang BELUM login
 * Jika user sudah login, akan redirect ke dashboard/home
 */
export default function GuestRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika sudah login, redirect ke home
    if (!isLoading && isAuthenticated) {
      router.push("/pages/home");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading saat checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Jika sudah authenticated, jangan render children (akan redirect)
  if (isAuthenticated) {
    return null;
  }

  // Jika belum login, render children (halaman guest)
  return <>{children}</>;
}
