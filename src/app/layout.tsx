import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AdminShell from "@/components/AdminShell";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Sonto's Organics — Business Manager",
  description: "Complete business management for Sonto's Organics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <AdminShell>
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
