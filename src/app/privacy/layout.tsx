import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description:
    "How CyberSkill collects, uses and protects your personal data when you use our World of Tanks boosting services. Read our full privacy policy.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
