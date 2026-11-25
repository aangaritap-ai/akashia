// Copia de respaldo de Akashia: todas las tablas y los archivos subidos.
//
//   npm run respaldo                 (guarda en Documentos/Akashia-respaldos)
//   node scripts/backup.mjs <carpeta>
//
// Solo lee de la base y del almacenamiento. La copia contiene datos personales:
// no se sube a git ni se comparte.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const KEEP_SNAPSHOTS = 12; // copias de datos que se conservan
const KEEP_DELETED_DAYS = 90; // archivos ya borrados del sitio

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    process.env[match[1]] ??= match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}
loadEnv(path.join(root, ".env"));
loadEnv(path.join(root, ".env.local"));

const dest = path.resolve(
  process.argv[2] ||
    process.env.AKASHIA_BACKUP_DIR ||
    path.join(os.homedir(), "Documents", "Akashia-respaldos")
);
const filesDir = path.join(dest, "archivos");
fs.mkdirSync(filesDir, { recursive: true });

function log(message) {
  console.log(message);
  fs.appendFileSync(
    path.join(dest, "respaldo.log"),
    `${new Date().toISOString()}  ${message}\n`
  );
}

const { PrismaClient, Prisma } = require("@prisma/client");
const { list } = require("@vercel/blob");
const models = Prisma.dmmf.datamodel.models;
const accessor = (name) => name[0].toLowerCase() + name.slice(1);

async function readDatabase() {
  const db = new PrismaClient();
  try {
    // La base gratuita se duerme: se reintenta hasta que despierte.
    for (let attempt = 1; ; attempt++) {
      try {
        await db.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt >= 10) throw err;
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    // Todo en una transacción, para que la copia sea de un mismo instante.
    return await db.$transaction(
      async (tx) => {
        const data = {};
        for (const model of models) {
          data[model.name] = await tx[accessor(model.name)].findMany();
        }
        return data;
      },
      { isolationLevel: "RepeatableRead", timeout: 180_000, maxWait: 30_000 }
    );
  } finally {
    await db.$disconnect();
  }
}

// Comprueba que cada relación de la copia apunte a una fila que también está.
function brokenReferences(data) {
  let broken = 0;
  for (const model of models) {
    for (const field of model.fields) {
      const from = field.relationFromFields;
      if (!from || from.length !== 1) continue;
      const to = field.relationToFields[0];
      const targets = new Set(data[field.type].map((row) => row[to]));
      for (const row of data[model.name]) {
        if (row[from[0]] != null && !targets.has(row[from[0]])) broken++;
      }
    }
  }
  return broken;
}

function saveSnapshot(data) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const file = path.join(dest, `base-${stamp}.json.gz`);
  const body = JSON.stringify({ createdAt: new Date().toISOString(), data });
  fs.writeFileSync(`${file}.tmp`, zlib.gzipSync(body));
  fs.renameSync(`${file}.tmp`, file);

  // Se vuelve a leer lo escrito y se comparan las cantidades.
  const saved = JSON.parse(zlib.gunzipSync(fs.readFileSync(file))).data;
  for (const model of models) {
    if (saved[model.name]?.length !== data[model.name].length) {
      throw new Error(`La copia de ${model.name} quedó incompleta`);
    }
  }
  return file;
}

function pruneSnapshots() {
  const old = fs
    .readdirSync(dest)
    .filter((name) => /^base-.*\.json\.gz$/.test(name))
    .sort()
    .slice(0, -KEEP_SNAPSHOTS);
  for (const name of old) fs.rmSync(path.join(dest, name));
  return old.length;
}

// Ruta local segura para un archivo del almacenamiento (sin salir de la
// carpeta y sin caracteres que Windows no admite).
function localName(pathname) {
  return pathname
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .map((part) => {
      const clean = part
        .replace(/[<>:"\\|?*\x00-\x1f]/g, "_")
        .replace(/[. ]+$/, "_");
      const ext = path.extname(clean).slice(0, 12);
      return clean.length > 120 ? clean.slice(0, 108) + ext : clean;
    })
    .join("/");
}

async function copyFiles() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("Falta BLOB_READ_WRITE_TOKEN en .env.local");

  const blobs = [];
  let cursor;
  do {
    const page = await list({ token, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  let downloaded = 0;
  for (const blob of blobs) {
    const target = path.join(filesDir, localName(blob.pathname));
    if (fs.existsSync(target) && fs.statSync(target).size === blob.size) continue;
    const res = await fetch(blob.url);
    if (!res.ok) throw new Error(`No se pudo descargar un archivo (${res.status})`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    downloaded++;
  }
  return { blobs, downloaded };
}

// Lo que ya se borró del sitio (historias vencidas, por ejemplo) no se guarda
// para siempre: se elimina de la copia pasado el plazo.
function pruneDeletedFiles(blobs) {
  const indexFile = path.join(dest, "archivos-borrados.json");
  const since = fs.existsSync(indexFile)
    ? JSON.parse(fs.readFileSync(indexFile, "utf8"))
    : {};
  const current = new Set(blobs.map((b) => localName(b.pathname)));
  const next = {};
  let removed = 0;
  for (const entry of fs.readdirSync(filesDir, {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile()) continue;
    const full = path.join(entry.parentPath, entry.name);
    const name = path.relative(filesDir, full).replaceAll("\\", "/");
    if (current.has(name)) continue;
    const first = since[name] ?? Date.now();
    if (Date.now() - first > KEEP_DELETED_DAYS * 86_400_000) {
      fs.rmSync(full);
      removed++;
    } else {
      next[name] = first;
    }
  }
  fs.writeFileSync(indexFile, JSON.stringify(next, null, 2));
  return removed;
}

try {
  const data = await readDatabase();
  const rows = Object.values(data).reduce((n, list) => n + list.length, 0);
  const broken = brokenReferences(data);
  const file = saveSnapshot(data);
  const { blobs, downloaded } = await copyFiles();
  const bytes = blobs.reduce((n, b) => n + b.size, 0);
  const removed = pruneDeletedFiles(blobs);
  const oldSnapshots = pruneSnapshots();

  log(
    `Copia correcta: ${models.length} tablas, ${rows} filas (` +
      `${data.User?.length ?? 0} cuentas), ${blobs.length} archivos ` +
      `(${(bytes / 1048576).toFixed(1)} MB, ${downloaded} nuevos), ` +
      `referencias rotas: ${broken}. Datos en ${path.basename(file)}. ` +
      `Antiguas eliminadas: ${oldSnapshots} copias, ${removed} archivos.`
  );
  if (broken > 0) process.exitCode = 1;
} catch (err) {
  log(`FALLÓ la copia: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
}
