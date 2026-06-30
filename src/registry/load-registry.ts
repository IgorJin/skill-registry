import path from "node:path";
import fg from "fast-glob";
import { ZodError } from "zod";
import type {
  ChecklistMetadata,
  EntityKind,
  PatternMetadata,
  RecipeMetadata,
  Registry,
  RegistryEntity,
  SkillMetadata,
  WorkflowMetadata
} from "./types.js";
import {
  checklistMetadataSchema,
  patternMetadataSchema,
  recipeMetadataSchema,
  skillMetadataSchema,
  workflowMetadataSchema
} from "./schemas.js";
import { readYamlFile } from "../utils/read-yaml.js";

const yamlByKind: Record<EntityKind, string> = {
  skills: "skill.yaml",
  patterns: "pattern.yaml",
  recipes: "recipe.yaml",
  workflows: "workflow.yaml",
  checklists: "checklist.yaml"
};

export async function loadRegistry(rootDir = process.cwd()): Promise<Registry> {
  const registry: Registry = {
    skills: new Map(),
    patterns: new Map(),
    recipes: new Map(),
    workflows: new Map(),
    checklists: new Map()
  };

  await loadKind(rootDir, "skills", registry.skills, skillMetadataSchema.parse);
  await loadKind(rootDir, "patterns", registry.patterns, patternMetadataSchema.parse);
  await loadKind(rootDir, "recipes", registry.recipes, recipeMetadataSchema.parse);
  await loadKind(rootDir, "workflows", registry.workflows, workflowMetadataSchema.parse);
  await loadKind(rootDir, "checklists", registry.checklists, checklistMetadataSchema.parse);

  return registry;
}

async function loadKind<TMetadata>(
  rootDir: string,
  kind: EntityKind,
  target: Map<string, RegistryEntity<TMetadata>>,
  parseMetadata: (input: unknown) => TMetadata
): Promise<void> {
  const yamlName = yamlByKind[kind];
  const files = await fg(`${kind}/*/${yamlName}`, { cwd: rootDir, onlyFiles: true });

  for (const relativePath of files.sort()) {
    const yamlPath = path.join(rootDir, relativePath);
    const dir = path.dirname(yamlPath);
    const metadata = await readMetadataFile(yamlPath, relativePath, parseMetadata);
    const id = getId(metadata);

    if (target.has(id)) {
      throw new Error(`Duplicate ${kind} id "${id}" in ${relativePath}`);
    }

    target.set(id, {
      kind,
      id,
      dir,
      yamlPath,
      metadata
    });
  }
}

async function readMetadataFile<TMetadata>(
  yamlPath: string,
  relativePath: string,
  parseMetadata: (input: unknown) => TMetadata
): Promise<TMetadata> {
  try {
    const raw = await readYamlFile(yamlPath);
    return parseMetadata(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues
        .map((issue) => `- ${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("\n");
      throw new Error(`Invalid metadata in ${relativePath}:\n${issues}`);
    }

    if (error instanceof Error) {
      throw new Error(`Failed to read ${relativePath}: ${error.message}`);
    }

    throw error;
  }
}

function getId(metadata: unknown): string {
  if (typeof metadata === "object" && metadata !== null && "id" in metadata && typeof metadata.id === "string") {
    return metadata.id;
  }

  throw new Error("Metadata object does not contain a string id.");
}
