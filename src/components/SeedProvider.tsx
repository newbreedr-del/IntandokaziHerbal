"use client";

import { useEffect, ReactNode } from "react";
import { seedIfNeeded } from "@/lib/seed";

export default function SeedProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    seedIfNeeded();
  }, []);

  return <>{children}</>;
}
