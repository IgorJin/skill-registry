import { z } from "zod";

const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/, "version must be semver, for example 0.1.0");
const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be kebab-case");
const stringListSchema = z.array(z.string().min(1)).default([]);

const dependsOnSchema = z
  .object({
    skills: stringListSchema.optional(),
    patterns: stringListSchema.optional(),
    checklists: stringListSchema.optional()
  })
  .strict();

export const skillMetadataSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    version: semverSchema,
    description: z.string().min(1),
    category: z.string().min(1),
    tags: stringListSchema,
    models: stringListSchema,
    capabilities: stringListSchema,
    dependsOn: dependsOnSchema.optional(),
    requiredFiles: stringListSchema,
    entrypoint: z.string().min(1)
  })
  .strict();

export const patternMetadataSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    version: semverSchema,
    description: z.string().min(1),
    tags: stringListSchema,
    entrypoint: z.string().min(1)
  })
  .strict();

export const recipeMetadataSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    version: semverSchema,
    description: z.string().min(1),
    tags: stringListSchema,
    uses: dependsOnSchema.extend({ workflow: z.string().optional() }).optional(),
    requiredFiles: stringListSchema,
    entrypoint: z.string().min(1)
  })
  .strict();

export const workflowMetadataSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    version: semverSchema,
    description: z.string().min(1),
    tags: stringListSchema,
    steps: z.array(
      z
        .object({
          id: idSchema,
          title: z.string().min(1),
          description: z.string().min(1),
          uses: dependsOnSchema.optional()
        })
        .strict()
    ),
    requiredFiles: stringListSchema
  })
  .strict();

export const checklistMetadataSchema = z
  .object({
    id: idSchema,
    name: z.string().min(1),
    version: semverSchema,
    description: z.string().min(1),
    tags: stringListSchema,
    entrypoint: z.string().min(1)
  })
  .strict();
