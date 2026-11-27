// Comprueba que todos los idiomas tengan los mismos textos y los mismos datos
// variables ({nombre}) que el español. Falla antes de publicar si falta algo.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../messages/", import.meta.url);
const BASE = "es.json";

const flatten = (node, prefix = "", out = new Map()) => {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out.set(path, value);
    else flatten(value, path, out);
  }
  return out;
};
const load = (file) => flatten(JSON.parse(readFileSync(new URL(file, dir))));
// Posición de la llave que cierra la que se abre en `open`.
const closing = (text, open) => {
  for (let i = open, depth = 0; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}" && --depth === 0) return i;
  }
  return -1;
};

// Nombres de variables y etiquetas de un texto: {name}, <b>…</b> y los de
// {count, plural, one {…} other {…}}, mirando también dentro de cada opción.
function collect(text, found) {
  for (const [, tag] of text.matchAll(/<([A-Za-z]\w*)>/g)) found.add(`<${tag}>`);
  for (let i = text.indexOf("{"); i >= 0; i = text.indexOf("{", i + 1)) {
    const end = closing(text, i);
    if (end < 0) {
      found.add("(llave sin cerrar)");
      break;
    }
    const inner = text.slice(i + 1, end);
    const [, name, options] =
      inner.match(/^\s*([A-Za-z]\w*)\s*(?:,\s*\w+\s*(?:,([\s\S]*))?)?$/) ?? [];
    if (name) found.add(name);
    // Cada opción es "clave {texto}"; el texto puede llevar sus variables.
    for (let j = options?.indexOf("{") ?? -1; j >= 0; ) {
      const stop = closing(options, j);
      if (stop < 0) break;
      collect(options.slice(j + 1, stop), found);
      j = options.indexOf("{", stop + 1);
    }
    i = end;
  }
  return found;
}
const slots = (text) => [...collect(text, new Set())].sort().join(",");

const base = load(BASE);
const problems = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  if (file === BASE) continue;
  const other = load(file);
  for (const [key, text] of base) {
    if (!other.has(key)) problems.push(`${file}: falta "${key}"`);
    else if (!other.get(key).trim()) problems.push(`${file}: "${key}" está vacío`);
    else if (slots(other.get(key)) !== slots(text))
      problems.push(`${file}: "${key}" no usa las mismas variables que ${BASE}`);
  }
  for (const key of other.keys()) {
    if (!base.has(key)) problems.push(`${file}: sobra "${key}"`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problema(s) en los idiomas.`);
  process.exit(1);
}
console.log(`Idiomas correctos (${base.size} textos).`);
