import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/battle-pass";
const TITLE = "WoT Battle Pass Boost — All 50 Levels";
const DESCRIPTION =
  "WoT Battle Pass boost — complete all 50 levels and claim the season's exclusive reward tank. Fast, secure season progression by pro players.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 10 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Battle Pass", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
