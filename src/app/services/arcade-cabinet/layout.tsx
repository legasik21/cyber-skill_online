import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/arcade-cabinet";
const TITLE = "Arcade Cabinet: Equalize! — Event Boost";
const DESCRIPTION =
  "Farm the World of Tanks Arcade Cabinet: Equalize! event (June 12–21, 2026) — equalized all-tier battles dropping credits, bonds, Battle Pass Points and Free XP. Pro boosting before it ends.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 15 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Arcade Cabinet: Equalize!", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
