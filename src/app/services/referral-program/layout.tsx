import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/referral-program";
const TITLE = "WoT Referral Program Service";
const DESCRIPTION =
  "Get a Tier 8 Premium tank and bonds through the WoT Referral Program. We handle all recruiting for you — fixed $100 price, completed in 7–14 days.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 100 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Referral Program", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
