import { readFile, readdir } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const staticDirectory = resolve(process.cwd(), "apps/web/.next/static");
const forbiddenMarkers = [
  "GUEST_TOKEN_SIGNING_SECRET",
  "OBJECT_STORAGE_SECRET_ACCESS_KEY",
  "SENTRY_AUTH_TOKEN",
  "@wedding-quest/infrastructure",
  "@wedding-quest/database",
];
const inspectedExtensions = new Set([".js", ".json", ".map", ".txt"]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(path) : [path];
    }),
  );

  return files.flat();
}

const files = (await collectFiles(staticDirectory)).filter((file) =>
  inspectedExtensions.has(extname(file)),
);
const failures = [];

for (const file of files) {
  const contents = await readFile(file, "utf8");
  for (const marker of forbiddenMarkers) {
    if (contents.includes(marker)) failures.push(`${marker} found in ${file}`);
  }
}

if (failures.length > 0) {
  console.error("Client bundle boundary verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Client bundle boundary verified across ${files.length} static files.`);
