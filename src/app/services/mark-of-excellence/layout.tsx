import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const PATH = "/services/mark-of-excellence";
const TITLE = "Mark of Excellence Boost (3 MoE)";
const DESCRIPTION =
  "Get 3 Marks of Excellence on your favourite tanks with top-1% boosters. Show elite World of Tanks performance with guaranteed MoE results and safety.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={serviceJsonLd({ name: TITLE, description: DESCRIPTION, path: PATH, priceFrom: 20 })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/#services" },
          { name: "Mark of Excellence", path: PATH },
        ])}
      />
      {children}
    </>
  );
}
