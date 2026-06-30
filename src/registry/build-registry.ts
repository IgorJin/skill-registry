import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Registry, RegistrySnapshot } from "./types.js";

export async function buildRegistry(registry: Registry, rootDir = process.cwd()): Promise<string> {
  const snapshot: RegistrySnapshot = {
    generatedAt: new Date().toISOString(),
    skills: [...registry.skills.values()].map((entity) => entity.metadata),
    patterns: [...registry.patterns.values()].map((entity) => entity.metadata),
    recipes: [...registry.recipes.values()].map((entity) => entity.metadata),
    workflows: [...registry.workflows.values()].map((entity) => entity.metadata),
    checklists: [...registry.checklists.values()].map((entity) => entity.metadata)
  };

  const outputPath = path.join(rootDir, "registry.generated.json");
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return outputPath;
}
