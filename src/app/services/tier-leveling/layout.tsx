import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/tier-leveling";
const TITLE = "WoT Tier Leveling Service — Tank Grinding";
const DESCRIPTION =
  "Rapidly level any World of Tanks tank line or crew to Tier X. Skip the grind with fast, secure tech-tree boosting by professional players.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 25 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Tier Leveling", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
