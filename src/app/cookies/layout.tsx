import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/cookies",
  title: "Cookie Policy",
  description:
    "How CyberSkill uses cookies and similar technologies on our World of Tanks boosting website, and how you can manage your cookie preferences.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
