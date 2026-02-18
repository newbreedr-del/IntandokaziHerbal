"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SeedProvider from "@/components/SeedProvider";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStore = pathname.startsWith("/store");

  if (isStore) {
    return <>{children}</>;
  }

  return (
    <SeedProvider>
      <Sidebar />
      <main className="lg:pl-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </SeedProvider>
  );
}
