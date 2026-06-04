"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Truck, Calendar, CalendarDays, LogOut, Menu, X, Brain, Shield
} from "lucide-react";
import { signOut } from "next-auth/react";

const SUPER_ADMIN_EMAIL = "mandubusabelo@gmail.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, router, pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-200 border-t-brand-600 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const isSuperAdmin =
    session.user?.email === SUPER_ADMIN_EMAIL ||
    (session.user as any)?.role === "super_admin";

  const userInitials = session.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/bookings", icon: Calendar, label: "Bookings" },
    { href: "/admin/availability", icon: CalendarDays, label: "Availability" },
    { href: "/admin/invoices", icon: FileText, label: "Invoices" },
    { href: "/admin/tracking", icon: Truck, label: "Tracking" },
  ];

  const superAdminItems = [
    { href: "/admin/ai-controls", icon: Brain, label: "AI Controls", badge: "Super Admin" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7">
            <Image src="/icon.png" alt="Intandokazi" fill className="object-contain" />
          </div>
          <span className="font-semibold text-brand-900 text-sm">Admin Panel</span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
          {userInitials}
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow">
              <Image src="/icon.png" alt="Intandokazi Herbal" width={36} height={36} className="object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Intandokazi</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
            </div>
            {isSuperAdmin && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center" title="Super Admin">
                <Shield className="w-3 h-3 text-amber-400" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Main</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-brand-600 text-white font-medium shadow-lg shadow-brand-900/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
              </Link>
            );
          })}

          {/* Super Admin section */}
          {isSuperAdmin && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mt-5 mb-2">Super Admin</p>
              {superAdminItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? "bg-violet-600 text-white font-medium shadow-lg shadow-violet-900/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-full font-medium">
                      SA
                    </span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Sign out + footer */}
        <div className="px-3 py-3 border-t border-gray-800 space-y-1">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
          <p className="text-xs text-gray-600 text-center pt-1">© 2026 Intandokazi Herbal</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

