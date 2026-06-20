import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/exp-farm";
const TITLE = "World of Tanks XP Boost — Exp & Free XP Farm";
const DESCRIPTION =
  "World of Tanks XP boost: farm experience on any tank in your garage. Fast, affordable XP & Free XP farming to unlock modules and new tanks — no grind.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 3 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Exp Farm", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
