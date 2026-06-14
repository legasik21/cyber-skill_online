// Renders a JSON-LD structured-data <script>. Plain component (no "use client")
// so it works in both Server and Client component trees; it only emits markup.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject; escape "<" defensively.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
