import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/onslaught";
const TITLE = "WoT Onslaught Boost — Legend Rank";
const DESCRIPTION =
  "Climb to Legend rank in World of Tanks Onslaught. Our 7v7 specialists boost your rating and earn bonds, styles and the annual reward tank — securely.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 15 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Onslaught", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
