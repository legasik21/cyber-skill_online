import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/terms",
  title: "Terms of Service",
  description:
    "The terms governing use of CyberSkill's World of Tanks boosting services — orders, payments, refunds and account safety. Read before you order.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
