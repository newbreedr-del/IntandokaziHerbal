"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname.startsWith("/pay") || pathname.startsWith("/store");

  if (isPublic) return <>{children}</>;
  return <SessionProvider>{children}</SessionProvider>;
}
