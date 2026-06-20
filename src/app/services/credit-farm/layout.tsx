import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/credit-farm";
const TITLE = "WoT Credit Booster & Bonds Farm";
const DESCRIPTION =
  "WoT credit booster: farm millions of credits & bonds fast — no grind. Efficient Front Line farming by pros, VPN-protected account safety.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 15 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Credit Farming", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
