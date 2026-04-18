import type { Metadata } from "next";
import { CartProvider } from "@/lib/cartContext";

export const metadata: Metadata = {
  title: "Intandokazi Herbal — Natural & Traditional Medicines",
  description: "Authentic African herbal remedies, traditional medicines and organic wellness products. Shop online with fast delivery across South Africa.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}

