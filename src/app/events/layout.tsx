import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/events",
  title: "WoT Events & Boost Offers",
  description:
    "Current World of Tanks events and limited-time boost offers — Onslaught seasons, Battle Pass, Holiday Ops and more. Grab special deals before they end.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
