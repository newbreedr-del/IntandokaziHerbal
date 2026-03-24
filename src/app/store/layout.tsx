import type { Metadata } from "next";
import { CartProvider } from "@/lib/cartContext";
import RespondIOWidget from "@/components/RespondIOWidget";

export const metadata: Metadata = {
  title: "Ntankokazi Herbal — Natural & Traditional Medicines",
  description: "Authentic African herbal remedies, traditional medicines and organic wellness products. Shop online with fast delivery across South Africa.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <RespondIOWidget />
    </CartProvider>
  );
}
