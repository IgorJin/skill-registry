#!/usr/bin/env node
import { Command } from "commander";
import { ZodError } from "zod";
import { buildRegistry } from "./registry/build-registry.js";
import { loadRegistry } from "./registry/load-registry.js";
import { validateRegistry } from "./registry/validate-registry.js";
import { compileSkillPrompt } from "./compiler/compile-prompt.js";

const program = new Command();

program
  .name("skill")
  .description("Validate, list, build, and compile the AI Skill.")
  .version("0.1.0");

program.command("validate").description("Validate YAML files, required files, and cross-references.").action(runValidate);
program.command("list").description("List available skills, patterns, recipes, workflows, and checklists.").action(runList);
program.command("build").description("Build registry.generated.json with all metadata.").action(runBuild);
program
  .command("compile")
  .description("Compile a prompt from a skill and its dependencies.")
  .requiredOption("--skill <id>", "Skill id to compile.")
  .action(runCompile);

program.parseAsync(process.argv).catch((error: unknown) => {
  printError(error);
  process.exitCode = 1;
});

async function runValidate(): Promise<void> {
  const registry = await loadRegistry();
  const result = await validateRegistry(registry);

  if (!result.ok) {
    console.error("Registry validation failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Registry validation passed.");
}

async function runList(): Promise<void> {
  const registry = await loadRegistry();

  printGroup("Skills", registry.skills.keys());
  printGroup("Patterns", registry.patterns.keys());
  printGroup("Recipes", registry.recipes.keys());
  printGroup("Workflows", registry.workflows.keys());
  printGroup("Checklists", registry.checklists.keys());
}

async function runBuild(): Promise<void> {
  const registry = await loadRegistry();
  const result = await validateRegistry(registry);

  if (!result.ok) {
    throw new Error(`Cannot build invalid registry:\n${result.errors.map((error) => `- ${error}`).join("\n")}`);
  }

  const outputPath = await buildRegistry(registry);
  console.log(`Generated ${outputPath}`);
}

async function runCompile(options: { skill: string }): Promise<void> {
  const registry = await loadRegistry();
  const result = await validateRegistry(registry);

  if (!result.ok) {
    throw new Error(`Cannot compile invalid registry:\n${result.errors.map((error) => `- ${error}`).join("\n")}`);
  }

  process.stdout.write(await compileSkillPrompt(registry, options.skill));
}

function printGroup(title: string, ids: Iterable<string>): void {
  console.log(`${title}:`);
  for (const id of [...ids].sort()) {
    console.log(`- ${id}`);
  }
  console.log("");
}

function printError(error: unknown): void {
  if (error instanceof ZodError) {
    console.error("YAML validation failed:");
    for (const issue of error.issues) {
      console.error(`- ${issue.path.join(".") || "root"}: ${issue.message}`);
    }
    return;
  }

  if (error instanceof Error) {
    console.error(error.message);
    return;
  }

  console.error(String(error));
}
