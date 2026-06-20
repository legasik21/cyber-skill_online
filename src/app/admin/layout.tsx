import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import AdminProviders from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Admin area is NOT localized and must never be indexed. It is a separate root
// layout (its own <html>/<body>) because the public pages live under
// app/[locale] and there is no shared top-level root layout.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `Admin | ${SITE_NAME}`,
  description: "CyberSkill administration area.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
