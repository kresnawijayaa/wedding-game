import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();

const packages = {
  web: "apps/web/package.json",
  worker: "apps/worker/package.json",
  game: "packages/game/package.json",
  shared: "packages/shared/package.json",
  database: "packages/database/package.json",
  config: "packages/config/package.json",
  tooling: "packages/tooling/package.json",
  infrastructure: "packages/infrastructure/package.json",
};

const manifests = Object.fromEntries(
  await Promise.all(
    Object.entries(packages).map(async ([key, path]) => {
      const contents = await readFile(resolve(root, path), "utf8");
      return [key, JSON.parse(contents)];
    }),
  ),
);

const failures = [];
const dependencyNames = (manifest) =>
  new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);

const expectedNames = {
  web: "@wedding-quest/web",
  worker: "@wedding-quest/worker",
  game: "@wedding-quest/game",
  shared: "@wedding-quest/shared",
  database: "@wedding-quest/database",
  config: "@wedding-quest/config",
  tooling: "@wedding-quest/tooling",
  infrastructure: "@wedding-quest/infrastructure",
};

for (const [key, expectedName] of Object.entries(expectedNames)) {
  if (manifests[key].name !== expectedName) {
    failures.push(`${packages[key]} must use package name ${expectedName}.`);
  }
  if (manifests[key].private !== true) {
    failures.push(`${packages[key]} must remain private.`);
  }
}

const forbiddenGameDependencies = [
  "next",
  "drizzle-orm",
  "redis",
  "bullmq",
  "@nestjs/core",
  "socket.io",
  "ioredis",
  "postgres",
  "@aws-sdk/client-s3",
  "@wedding-quest/infrastructure",
  "@wedding-quest/database",
];
const gameDependencies = dependencyNames(manifests.game);
for (const dependency of forbiddenGameDependencies) {
  if (gameDependencies.has(dependency)) {
    failures.push(`@wedding-quest/game must not depend on ${dependency}.`);
  }
}

if (dependencyNames(manifests.web).has("@wedding-quest/game")) {
  failures.push(
    "@wedding-quest/web must not depend on the game package before the lazy-load integration task.",
  );
}

for (const serverPackage of ["@wedding-quest/database", "@wedding-quest/infrastructure"]) {
  if (!dependencyNames(manifests.web).has(serverPackage)) {
    failures.push(
      `@wedding-quest/web must declare ${serverPackage} for server-only readiness checks.`,
    );
  }
}

if (dependencyNames(manifests.worker).has("@wedding-quest/web")) {
  failures.push("@wedding-quest/worker must not import private web application modules.");
}

if (!manifests.database.exports?.["./server"]) {
  failures.push("@wedding-quest/database must expose server modules only through ./server.");
}

for (const exportPath of Object.keys(manifests.infrastructure.exports ?? {})) {
  if (!exportPath.startsWith("./server/")) {
    failures.push("@wedding-quest/infrastructure may expose only ./server/* entry points.");
  }
}

if (failures.length > 0) {
  console.error("Workspace boundary verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace package boundaries verified.");
