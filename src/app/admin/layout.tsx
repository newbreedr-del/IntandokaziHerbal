"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [status, router, isLoginPage]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Login page doesn't need sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Redirect if not authenticated (will happen via useEffect)
  if (status === "unauthenticated") {
    return null;
  }

  // Authenticated - show admin layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
