# AI Skill Registry

AI Skill Registry is a Git-native library of AI skills, patterns, recipes, workflows, and checklists. Knowledge is stored as YAML metadata plus Markdown content, so it can be reviewed, versioned, validated, and later used by a prompt compiler or AI agent adapter.

This is not a SaaS, backend, database, or UI project. It is a local prompt/skill registry for Codex Desktop and a small TypeScript CLI around a declarative registry.

## Fast Local Prompt Commands

The fastest workflow is the bash command in `bin/skill-registry`. Run it from the project directory you are working on:

```bash
skill-registry <mode> "<task>"
```

Examples:

```bash
./bin/skill-registry coder "Implement Gmail ingestion retry"
./bin/skill-registry security "Review Google OAuth token storage"
./bin/skill-registry architect "Design source/storage abstraction"
./bin/skill-registry marketing "Research positioning for NotesCombine"
```

The CLI detects the current project with `pwd`, reads project context when these files exist, assembles a Codex prompt, saves it to `/tmp/skill-registry-codex-prompt.md`, and copies it to the macOS clipboard with `pbcopy`.

Project context files:

- `AGENTS.md`
- `.ai/project-context.md`
- `.ai/architecture.md`
- `.ai/data-privacy.md`
- `.ai/coding-style.md`

Prompt parts:

1. `templates/codex-prompt.md`
2. `skills/core.md`
3. `skills/<mode>.md`
4. discovered project context
5. your task

Available modes:

- `architect`
- `coder`
- `marketing`
- `product`
- `qa`
- `reviewer`
- `security`

Optional shell shortcut:

```bash
alias skill-registry="$HOME/repositories/skill-registry/bin/skill-registry"
```

Then from any project:

```bash
skill-registry coder "Implement password reset"
```

## Architecture

- `skills/` contains domain expertise such as backend architecture, NestJS features, testing, and code review.
- `skills/*.md` contains simple mode prompt files for the local copied-prompt CLI.
- `patterns/` contains reusable LLM work patterns such as architecture-first, plan-then-code, and minimal-diff.
- `recipes/` contains applied task scenarios that may reference skills, patterns, checklists, and one workflow.
- `workflows/` contains ordered step definitions for common development flows.
- `checklists/` contains quality gates that can be attached to skills, recipes, or workflows.
- `templates/` contains prompt assembly templates.
- `bin/` contains local bash commands.
- `schemas/` documents the YAML contracts as JSON Schema.
- `src/registry/` loads, validates, and builds registry metadata.
- `src/compiler/` deterministically merges Markdown sections into a final prompt.

## Install

```bash
pnpm install
pnpm build
```

## Commands

```bash
pnpm skill-registry validate
pnpm skill-registry list
pnpm skill-registry compile --skill nestjs-feature
pnpm skill-registry build
```

Package scripts are also available:

```bash
pnpm validate
pnpm run list
pnpm compile --skill nestjs-feature
pnpm registry:build
```

## YAML Rules

- Every entity `id` must match its folder name.
- `version` must be semver.
- `entrypoint` must exist.
- `requiredFiles` must exist.
- `dependsOn` references must point to existing entities.
- Skills can depend on skills, patterns, and checklists.
- Recipes can reference skills, patterns, checklists, and a workflow.
- Workflow steps can use skills, patterns, and checklists.

## Add A Skill

1. Create a folder under `skills/` using the skill id, for example `skills/security-audit/`.
2. Add `skill.yaml` with an `id` that exactly matches the folder name.
3. Add every file listed in `requiredFiles`.
4. Set `entrypoint` to the main prompt file, usually `prompt.md`.
5. Reference only existing skills, patterns, and checklists in `dependsOn`.
6. Run `pnpm validate`.

Minimal `skill.yaml` shape:

```yaml
id: security-audit
name: Security Audit
version: 0.1.0
description: Review code and architecture for security risks.
category: security
tags: [security, review]
models: [chatgpt, codex, claude-code]
capabilities: [security-review, code-review]
dependsOn:
  patterns: [minimal-diff]
  checklists: [security-review]
requiredFiles: [README.md, principles.md, rules.md, prompt.md, checklist.md, anti-patterns.md]
entrypoint: prompt.md
```

## Compile Example

```bash
pnpm skill-registry compile --skill nestjs-feature
```

The compiler emits:

1. Skill title and description.
2. Skill core prompt.
3. Optional principles and rules.
4. Prompt text from dependent patterns.
5. Skill checklist and dependent checklists.
6. Optional anti-patterns.

The merge is intentionally deterministic and small.
