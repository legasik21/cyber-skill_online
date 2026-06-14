import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Admin area must never be indexed.
export const metadata: Metadata = pageMetadata({
  path: "/admin",
  title: "Admin",
  description: "CyberSkill administration area.",
  noindex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
