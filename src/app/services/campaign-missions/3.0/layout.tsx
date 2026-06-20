import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/campaign-missions/3.0";
const TITLE = "Black Rock Mission Boost (Campaign 3.0)";
const DESCRIPTION =
  "Earn the Black Rock reward tank — we clear all Campaign 3.0 missions for you. Fast, secure boosting by professional players.";

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
