import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/campaign-missions/2.0";
const TITLE = "Campaign 2.0 Boost — Object 279(e)";
const DESCRIPTION =
  "Earn the legendary Object 279(e) with our WoT Campaign 2.0 boost. We complete all 279e personal missions, including the hardest, with top players.";

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
