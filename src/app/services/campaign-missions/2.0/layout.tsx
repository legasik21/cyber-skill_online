import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/campaign-missions/2.0";
const TITLE = "Obj. 279(e) Mission Boost (Campaign 2.0)";
const DESCRIPTION =
  "Get the Object 279(e) — we complete every Campaign 2.0 mission with honors. Expert boosters, guaranteed result, full account safety.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Campaign Missions", path: "/services/campaign-missions" },
          { name: "Campaign 2.0", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
