import path from "node:path";
import type { DependsOn, Registry, RegistryEntity, RecipeMetadata, WorkflowMetadata } from "./types.js";
import { fileExists } from "../utils/file-exists.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export async function validateRegistry(registry: Registry): Promise<ValidationResult> {
  const errors: string[] = [];

  for (const entity of registry.skills.values()) {
    await validateIdAndFiles(entity, entity.metadata.requiredFiles, entity.metadata.entrypoint, errors);
    validateDependsOn(`skills/${entity.id}`, entity.metadata.dependsOn, registry, errors);
  }

  for (const entity of registry.patterns.values()) {
    await validateIdAndFiles(entity, ["pattern.yaml", "prompt.md"], entity.metadata.entrypoint, errors);
  }

  for (const entity of registry.recipes.values()) {
    await validateIdAndFiles(entity, entity.metadata.requiredFiles, entity.metadata.entrypoint, errors);
    validateRecipeUses(entity, registry, errors);
  }

  for (const entity of registry.workflows.values()) {
    await validateWorkflow(entity, registry, errors);
  }

  for (const entity of registry.checklists.values()) {
    await validateIdAndFiles(entity, ["checklist.yaml", "checklist.md"], entity.metadata.entrypoint, errors);
  }

  return { ok: errors.length === 0, errors };
}

async function validateIdAndFiles(
  entity: RegistryEntity<{ id: string }>,
  requiredFiles: string[],
  entrypoint: string | undefined,
  errors: string[]
): Promise<void> {
  const folderName = path.basename(entity.dir);
  if (entity.id !== folderName) {
    errors.push(`${entity.kind}/${folderName}: metadata id "${entity.id}" must match folder name.`);
  }

  for (const file of requiredFiles) {
    if (!(await fileExists(path.join(entity.dir, file)))) {
      errors.push(`${entity.kind}/${entity.id}: required file "${file}" does not exist.`);
    }
  }

  if (entrypoint && !(await fileExists(path.join(entity.dir, entrypoint)))) {
    errors.push(`${entity.kind}/${entity.id}: entrypoint "${entrypoint}" does not exist.`);
  }
}

function validateRecipeUses(entity: RegistryEntity<RecipeMetadata>, registry: Registry, errors: string[]): void {
  const uses = entity.metadata.uses;
  if (!uses) {
    return;
  }

  validateDependsOn(`recipes/${entity.id}`, uses, registry, errors);

  if (uses.workflow && !registry.workflows.has(uses.workflow)) {
    errors.push(`recipes/${entity.id}: workflow dependency "${uses.workflow}" does not exist.`);
  }
}

async function validateWorkflow(entity: RegistryEntity<WorkflowMetadata>, registry: Registry, errors: string[]): Promise<void> {
  await validateIdAndFiles(entity, entity.metadata.requiredFiles, undefined, errors);

  for (const step of entity.metadata.steps) {
    validateDependsOn(`workflows/${entity.id} step "${step.id}"`, step.uses, registry, errors);
  }
}

function validateDependsOn(location: string, dependsOn: DependsOn | undefined, registry: Registry, errors: string[]): void {
  if (!dependsOn) {
    return;
  }

  for (const id of dependsOn.skills ?? []) {
    if (!registry.skills.has(id)) {
      errors.push(`${location}: skill dependency "${id}" does not exist.`);
    }
  }

  for (const id of dependsOn.patterns ?? []) {
    if (!registry.patterns.has(id)) {
      errors.push(`${location}: pattern dependency "${id}" does not exist.`);
    }
  }

  for (const id of dependsOn.checklists ?? []) {
    if (!registry.checklists.has(id)) {
      errors.push(`${location}: checklist dependency "${id}" does not exist.`);
    }
  }
}
