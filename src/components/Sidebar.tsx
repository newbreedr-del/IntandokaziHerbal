"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  BookOpen,
  Menu,
  X,
  Store,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { classNames } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients/", icon: Users },
  { name: "Products", href: "/products/", icon: Package },
  { name: "Sales", href: "/sales/", icon: ShoppingCart },
  { name: "Payments", href: "/payments/", icon: CreditCard },
  { name: "Messages", href: "/messages/", icon: MessageSquare },
  { name: "Bookkeeping", href: "/bookkeeping/", icon: BookOpen },
  { name: "Online Store", href: "/store", icon: Store },
  { name: "Store Admin", href: "/store-admin", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href.replace(/\/$/, ""));
  };

  const navContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-brand-700/30">
        <div className="relative h-10 w-10 flex-shrink-0">
          <Image src="/logo.png" alt="Nthandokazi Herbal" fill className="object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Nthandokazi</h1>
          <p className="text-xs text-brand-200 font-medium -mt-0.5">Herbal</p>
        </div>
      </div>

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

      {/* Footer */}
      <div className="border-t border-brand-700/30 px-6 py-4">
        <p className="text-xs text-brand-300">&copy; {new Date().getFullYear()} Nthandokazi Herbal</p>
        <p className="text-xs text-brand-400 mt-0.5">Business Management</p>
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
