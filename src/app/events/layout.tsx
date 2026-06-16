import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/events",
  title: "WoT Events & Boost Offers",
  description:
    "Current, upcoming and past World of Tanks events with limited-time boost offers — Battle Pass Season XX, Tankfest 2026, Onslaught, special modes and more. Grab the rewards before they end.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
