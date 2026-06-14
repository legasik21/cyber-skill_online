import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/wn8-boost";
const TITLE = "WN8, Winrate & High Damage Boost";
const DESCRIPTION =
  "Raise your World of Tanks WN8, winrate and average damage with top-0.1% boosters. Transparent per-battle pricing, volume discounts and full account safety.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 10 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "WN8 Boost", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
