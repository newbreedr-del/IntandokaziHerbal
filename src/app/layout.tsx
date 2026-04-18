import type { Metadata } from "next";

import { Poppins, Playfair_Display } from "next/font/google";

import "./globals.css";

import AdminShell from "@/components/AdminShell";

import ToastProvider from "@/components/ui/Toast";

import ErrorBoundary from "@/components/ErrorBoundary";

import Providers from "@/components/Providers";



const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });



export const metadata: Metadata = {

  title: "Nthandokazi Herbal — Business Manager",

  description: "Complete business management for Nthandokazi Herbal",

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

};



export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (

    <html lang="en">

      <body className={`${poppins.variable} ${playfair.variable} font-poppins`}>

        <Providers>

          <ErrorBoundary>

            <AdminShell>

              {children}

            </AdminShell>

            <ToastProvider />

          </ErrorBoundary>

        </Providers>

      </body>

    </html>

  );

}

