import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/campaign-missions/3.0";
const TITLE = "Campaign 3.0 Boost — Black Rock";
const DESCRIPTION =
  "Get the Black Rock reward tank with our WoT Campaign 3.0 mission boost. Expert boosters finish every mission stage fast, safely and hassle-free.";

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
          { name: "Campaign 3.0", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
