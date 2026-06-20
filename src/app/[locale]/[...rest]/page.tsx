import { notFound } from "next/navigation";

// Catch-all so that any unmatched path inside a locale renders the localized
// not-found page (app/[locale]/not-found.tsx) within the locale layout — instead
// of the bare global fallback. Required by next-intl's App Router setup.
export default function CatchAllNotFound() {
  notFound();
}
