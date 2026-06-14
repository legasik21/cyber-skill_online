import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/guarantee",
  title: "Our Guarantee — Secure & Satisfaction",
  description:
    "CyberSkill's guarantee: 100% secure boosting with VPN protection, strict account safety, clear refund terms and satisfaction guaranteed on every order.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
