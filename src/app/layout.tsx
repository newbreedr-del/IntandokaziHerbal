import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AdminShell from "@/components/AdminShell";
import ToastProvider from "@/components/ui/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Nthandokazi Herbal — Business Manager",
  description: "Complete business management for Nthandokazi Herbal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${playfair.variable}`}>
        <ErrorBoundary>
          <AdminShell>
            {children}
          </AdminShell>
          <ToastProvider />
        </ErrorBoundary>
      </body>
    </html>
  );
}
