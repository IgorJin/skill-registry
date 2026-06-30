export type EntityKind = "skills" | "patterns" | "recipes" | "workflows" | "checklists";

export interface DependsOn {
  skills?: string[];
  patterns?: string[];
  checklists?: string[];
}

export interface SkillMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  models: string[];
  capabilities: string[];
  dependsOn?: DependsOn;
  requiredFiles: string[];
  entrypoint: string;
}

export interface PatternMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  entrypoint: string;
}

export interface RecipeMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  uses?: DependsOn & { workflow?: string };
  requiredFiles: string[];
  entrypoint: string;
}

export interface WorkflowStepUses extends DependsOn {}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  uses?: WorkflowStepUses;
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  steps: WorkflowStep[];
  requiredFiles: string[];
}

export interface ChecklistMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  entrypoint: string;
}

export interface RegistryEntity<TMetadata> {
  kind: EntityKind;
  id: string;
  dir: string;
  yamlPath: string;
  metadata: TMetadata;
}

export interface Registry {
  skills: Map<string, RegistryEntity<SkillMetadata>>;
  patterns: Map<string, RegistryEntity<PatternMetadata>>;
  recipes: Map<string, RegistryEntity<RecipeMetadata>>;
  workflows: Map<string, RegistryEntity<WorkflowMetadata>>;
  checklists: Map<string, RegistryEntity<ChecklistMetadata>>;
}

export interface RegistrySnapshot {
  generatedAt: string;
  skills: SkillMetadata[];
  patterns: PatternMetadata[];
  recipes: RecipeMetadata[];
  workflows: WorkflowMetadata[];
  checklists: ChecklistMetadata[];
}
