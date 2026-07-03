Task Manager object.

Purpose: manage project tasks as markdown files inside the current project.

Task locations:
- tasks/inbox/
- tasks/backlog/
- tasks/active/
- tasks/done/

Task files are discovered by id prefix, for example NC-0001.

Task file format:

# NC-XXXX: Title

## Goal

## Context

## Scope

## Acceptance criteria

## Implementation notes

## Changed files

## Tests

## Manual verification

## Diff summary

## Follow-up

Rules:
- Keep each task self-contained and useful as working context for a coding agent.
- Use the project task id exactly as provided.
- Prefer concrete acceptance criteria over vague intent.
- Keep scope small enough for one focused implementation pass.
- When a mode such as product or qa identifies work that should be tracked, create or propose a task using this format.
- When finishing a task, update the existing task file instead of creating a duplicate.
- Finish notes must include changed files, implementation summary, tests added or run, manual verification, diff summary, environment variables, deployment notes, and follow-up items.
