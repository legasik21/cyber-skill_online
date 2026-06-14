import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  path: "/referral",
  title: "Referral Rewards Program",
  description:
    "Invite friends to CyberSkill and earn $10 for every successful referral — your friend gets $10 off too. See the full referral program terms and rewards.",
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
