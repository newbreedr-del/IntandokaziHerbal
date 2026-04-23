"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import SeedProvider from "@/components/SeedProvider";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStore = pathname.startsWith("/store");
  const isAdmin = pathname.startsWith("/admin");
  const isPay = pathname.startsWith("/pay");

  // Store, Admin and Pay routes handle their own layout — no SessionProvider
  if (isStore || isAdmin || isPay) {
    return <>{children}</>;
  }

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
