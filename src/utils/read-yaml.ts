import { readFile } from "node:fs/promises";
import { parse } from "yaml";

export async function readYamlFile(path: string): Promise<unknown> {
  const content = await readFile(path, "utf8");
  return parse(content);
}
