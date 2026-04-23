"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import SeedProvider from "@/components/SeedProvider";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStore = pathname.startsWith("/store");
  const isPay = pathname.startsWith("/pay");
  const isAdmin = pathname.startsWith("/admin");

  // Public routes — no SessionProvider, no sidebar
  if (isStore || isPay) {
    return <>{children}</>;
  }

  // Admin routes have their own layout/sidebar — wrap with SessionProvider only
  if (isAdmin) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  // Internal dashboard routes — full shell with sidebar
  return (
    <SessionProvider>
      <SeedProvider>
        <Sidebar />
        <main className="lg:pl-64">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </SeedProvider>
    </SessionProvider>
  );
}
