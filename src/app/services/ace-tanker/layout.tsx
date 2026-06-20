import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/ace-tanker";
const TITLE = "WoT Ace Tanker Boost — Mastery Badge";
const DESCRIPTION =
  "Get the Ace Tanker mastery badge on any World of Tanks vehicle. Top-0.1% boosters secure the top-marksman score for your tanks — fast and safe.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 10 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Ace Tanker", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
