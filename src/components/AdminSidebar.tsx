"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Truck,
  Menu,
  X,
  LogOut,
  Leaf,
} from "lucide-react";
import { classNames } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Invoices", href: "/admin/invoices", icon: FileText },
  { name: "Tracking", href: "/admin/tracking", icon: Truck },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-brand-700/30">
        <div className="flex items-center justify-center h-10 w-10 bg-white rounded-full flex-shrink-0">
          <Leaf className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Nthandokazi</h1>
          <p className="text-xs text-brand-200 font-medium -mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* User Info */}
      {session?.user && (
        <div className="px-6 py-4 border-b border-brand-700/30">
          <p className="text-sm font-medium text-white">{session.user.name}</p>
          <p className="text-xs text-brand-300">{session.user.email}</p>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={classNames(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-brand-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon
                className={classNames(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  active ? "text-white" : "text-brand-300 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out Button */}
      <div className="border-t border-brand-700/30 px-3 py-4">
        <button
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-brand-300 group-hover:text-white transition-colors" />
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <div className="border-t border-brand-700/30 px-6 py-4">
        <p className="text-xs text-brand-300">&copy; {new Date().getFullYear()} Nthandokazi Herbal</p>
        <p className="text-xs text-brand-400 mt-0.5">Admin Panel</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-brand-600 p-2 text-white shadow-lg hover:bg-brand-700 transition-colors"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-brand-700 to-brand-900 transform transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-gradient-to-b from-brand-700 to-brand-900">
        {navContent}
      </aside>
    </>
  );
}
