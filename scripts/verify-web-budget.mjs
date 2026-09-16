import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

const buildDirectory = resolve(process.cwd(), "apps/web/.next");
const manifest = JSON.parse(await readFile(resolve(buildDirectory, "build-manifest.json"), "utf8"));
const initialFiles = [...manifest.polyfillFiles, ...manifest.rootMainFiles];
const budgetBytes = 220 * 1024;
let compressedBytes = 0;

for (const file of initialFiles) {
  const contents = await readFile(resolve(buildDirectory, file));
  compressedBytes += gzipSync(contents).byteLength;
}

const compressedKiB = (compressedBytes / 1024).toFixed(1);
if (compressedBytes > budgetBytes) {
  console.error(`Initial route JavaScript is ${compressedKiB} KiB gzip; budget is 220 KiB gzip.`);
  process.exit(1);
}

console.log(
  `Initial route JavaScript budget verified: ${compressedKiB} KiB gzip across ${initialFiles.length} files.`,
);
