import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

const PATH = "/services/campaign-missions";
const TITLE = "WoT Campaign Missions — Obj. 279e & 260";
const DESCRIPTION =
  "Complete the toughest World of Tanks campaign missions — Obj. 260, Obj. 279(e) and Black Rock — with expert boosters and unlock elite reward tanks.";

export const metadata: Metadata = {
  ...pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH }),
  // Absolute title for this page itself, PLUS a template so the child routes
  // (1.0 / 2.0 / 3.0) still inherit the "%s | CyberSkill" suffix. A plain
  // string title here would swallow the template for descendants.
  title: { absolute: `${TITLE} | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
};

// NOTE: Service/BreadcrumbList JSON-LD for this page lives in page.tsx (not
// here) so it does NOT cascade onto the 1.0/2.0/3.0 child routes.
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
