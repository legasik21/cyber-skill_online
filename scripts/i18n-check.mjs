// Verifies messages/de.json mirrors messages/en.json 1:1 (identical key shape),
// so next-intl never hits a missing-message key. Arrays are compared by length
// and element-wise shape. Exit 1 on any mismatch.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));
const de = JSON.parse(readFileSync(join(root, "messages/de.json"), "utf8"));

const problems = [];

function walk(a, b, path) {
  const ta = Array.isArray(a) ? "array" : typeof a;
  const tb = Array.isArray(b) ? "array" : typeof b;
  if (ta !== tb) {
    problems.push(`TYPE MISMATCH at ${path || "<root>"}: en=${ta} de=${tb}`);
    return;
  }
  if (ta === "array") {
    if (a.length !== b.length) {
      problems.push(`ARRAY LENGTH at ${path}: en=${a.length} de=${b.length}`);
    }
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) walk(a[i], b[i], `${path}[${i}]`);
    return;
  }
  if (ta === "object" && a !== null) {
    for (const k of Object.keys(a)) {
      if (!(k in b)) problems.push(`MISSING in de: ${path ? path + "." : ""}${k}`);
      else walk(a[k], b[k], path ? `${path}.${k}` : k);
    }
    for (const k of Object.keys(b)) {
      if (!(k in a)) problems.push(`EXTRA in de: ${path ? path + "." : ""}${k}`);
    }
  }
}

walk(en, de, "");

// Also flag empty-string values (untranslated placeholders) in either file.
function findEmpty(obj, path, label, out) {
  if (typeof obj === "string") {
    if (obj.trim() === "") out.push(`EMPTY ${label} value at ${path}`);
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => findEmpty(v, `${path}[${i}]`, label, out));
  } else if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) findEmpty(obj[k], path ? `${path}.${k}` : k, label, out);
  }
}
findEmpty(en, "", "en", problems);
findEmpty(de, "", "de", problems);

if (problems.length) {
  console.error(`i18n key-parity check FAILED (${problems.length} issue(s)):`);
  for (const p of problems) console.error("  - " + p);
  process.exit(1);
}
console.log("i18n key-parity check PASSED: de.json mirrors en.json 1:1.");
