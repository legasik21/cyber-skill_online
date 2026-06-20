import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/campaign-missions/1.0";
const TITLE = "Obj. 260 Mission Boost (Campaign 1.0)";
const DESCRIPTION =
  "Unlock the Object 260 reward tank — we complete all Campaign 1.0 personal missions for you. Fast, secure, by top-0.1% players.";

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
          { name: "Campaign 1.0", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
