export interface PromptSection {
  title: string;
  body: string | undefined;
}

export function renderSections(sections: PromptSection[]): string {
  return sections
    .filter((section) => section.body && section.body.trim().length > 0)
    .map((section) => `## ${section.title}\n\n${section.body?.trim()}`)
    .join("\n\n");
}
