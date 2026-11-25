import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { unitFileSchema, type UnitFile } from "./schema";

export interface LoadedUnit {
  path: string;
  relativePath: string;
  raw: string;
  data: UnitFile;
}

export function contentRoot(): string {
  return join(process.cwd(), "content", "curricula");
}

export function listUnitFiles(dir = contentRoot()): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listUnitFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

export function loadUnits(root = contentRoot()): {
  units: LoadedUnit[];
  errors: string[];
} {
  const units: LoadedUnit[] = [];
  const errors: string[] = [];

  for (const file of listUnitFiles(root)) {
    const raw = readFileSync(file, "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      errors.push(`${relative(process.cwd(), file)}: invalid JSON (${(error as Error).message})`);
      continue;
    }

    const result = unitFileSchema.safeParse(parsed);
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(
          `${relative(process.cwd(), file)}: ${issue.path.join(".")} — ${issue.message}`,
        );
      }
      continue;
    }

    units.push({
      path: file,
      relativePath: relative(process.cwd(), file),
      raw,
      data: result.data,
    });
  }

  return { units, errors };
}
