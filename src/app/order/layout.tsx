import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Post-checkout utility pages (success/error) should not be indexed.
export const metadata: Metadata = pageMetadata({
  path: "/order",
  title: "Order",
  description: "CyberSkill order status.",
  noindex: true,
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
