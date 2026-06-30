import path from "node:path";
import type { Registry } from "../registry/types.js";
import { fileExists } from "../utils/file-exists.js";
import { readMarkdown } from "../utils/read-markdown.js";
import { renderSections, type PromptSection } from "./render-sections.js";

export async function compileSkillPrompt(registry: Registry, skillId: string): Promise<string> {
  const skill = registry.skills.get(skillId);
  if (!skill) {
    throw new Error(`Skill "${skillId}" was not found.`);
  }

  const metadata = skill.metadata;
  const sections: PromptSection[] = [
    {
      title: "Description",
      body: metadata.description
    },
    {
      title: "Core Prompt",
      body: await readMarkdown(path.join(skill.dir, metadata.entrypoint))
    },
    {
      title: "Principles",
      body: await optionalMarkdown(skill.dir, "principles.md")
    },
    {
      title: "Rules",
      body: await optionalMarkdown(skill.dir, "rules.md")
    },
    {
      title: "Applied Patterns",
      body: await compilePatternPrompts(registry, metadata.dependsOn?.patterns ?? [])
    },
    {
      title: "Checklist",
      body: await compileChecklists(registry, skill.dir, metadata.dependsOn?.checklists ?? [])
    },
    {
      title: "Anti-patterns",
      body: await optionalMarkdown(skill.dir, "anti-patterns.md")
    }
  ];

  return `# Skill: ${metadata.name}\n\n${renderSections(sections)}\n`;
}

async function optionalMarkdown(dir: string, filename: string): Promise<string | undefined> {
  const filePath = path.join(dir, filename);
  if (!(await fileExists(filePath))) {
    return undefined;
  }

  return readMarkdown(filePath);
}

async function compilePatternPrompts(registry: Registry, patternIds: string[]): Promise<string | undefined> {
  const parts: string[] = [];

  for (const id of patternIds) {
    const pattern = registry.patterns.get(id);
    if (!pattern) {
      throw new Error(`Pattern "${id}" was not found.`);
    }

    parts.push(`### ${pattern.metadata.name}\n\n${await readMarkdown(path.join(pattern.dir, pattern.metadata.entrypoint))}`);
  }

  return parts.length > 0 ? parts.join("\n\n") : undefined;
}

async function compileChecklists(registry: Registry, skillDir: string, checklistIds: string[]): Promise<string | undefined> {
  const parts: string[] = [];
  const skillChecklist = await optionalMarkdown(skillDir, "checklist.md");

  if (skillChecklist) {
    parts.push(`### Skill Checklist\n\n${skillChecklist}`);
  }

  for (const id of checklistIds) {
    const checklist = registry.checklists.get(id);
    if (!checklist) {
      throw new Error(`Checklist "${id}" was not found.`);
    }

    parts.push(`### ${checklist.metadata.name}\n\n${await readMarkdown(path.join(checklist.dir, checklist.metadata.entrypoint))}`);
  }

  return parts.length > 0 ? parts.join("\n\n") : undefined;
}
