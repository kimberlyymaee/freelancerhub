import type { ImportColumn, ImportConfig, ImportRow } from "./types";

/**
 * Build a mapping from file header names to ImportColumn keys.
 * Uses case-insensitive matching against key, label, and aliases.
 */
export function buildColumnMapping(
  fileHeaders: string[],
  columns: ImportColumn[]
): Map<string, string> {
  const mapping = new Map<string, string>();

  for (const header of fileHeaders) {
    const normalized = header.toLowerCase().replace(/[_\s-]+/g, "");

    for (const col of columns) {
      const candidates = [col.key, col.label, ...(col.aliases ?? [])].map(
        (c) => c.toLowerCase().replace(/[_\s-]+/g, "")
      );

      if (candidates.includes(normalized)) {
        mapping.set(header, col.key);
        break;
      }
    }
  }

  return mapping;
}

/**
 * Validate and transform all parsed rows against the import config.
 */
export function validateRows(
  rows: Record<string, string>[],
  config: ImportConfig,
  columnMapping: Map<string, string>,
  fkLookups: Map<string, Map<string, string>>
): ImportRow[] {
  return rows.map((rawRow, index) => {
    const errors: string[] = [];
    const data: Record<string, unknown> = {};

    for (const col of config.columns) {
      let rawValue: string | undefined;
      for (const [fileHeader, colKey] of columnMapping.entries()) {
        if (colKey === col.key) {
          rawValue = rawRow[fileHeader];
          break;
        }
      }

      if (col.required && (!rawValue || rawValue.trim() === "")) {
        errors.push(`"${col.label}" is required`);
        continue;
      }

      if (!rawValue || rawValue.trim() === "") {
        data[col.key] = col.defaultValue ?? null;
        continue;
      }

      const trimmed = rawValue.trim();

      switch (col.type) {
        case "string":
          data[col.key] = trimmed;
          break;

        case "number": {
          const num = Number(trimmed.replace(/,/g, ""));
          if (isNaN(num)) {
            errors.push(
              `"${col.label}" must be a valid number (got "${trimmed}")`
            );
          } else {
            data[col.key] = num;
          }
          break;
        }

        case "date": {
          const parsed = parseDateFlexible(trimmed);
          if (!parsed) {
            errors.push(
              `"${col.label}" must be a valid date (got "${trimmed}")`
            );
          } else {
            data[col.key] = parsed;
          }
          break;
        }

        case "boolean": {
          const lower = trimmed.toLowerCase();
          if (["true", "yes", "1", "y"].includes(lower)) {
            data[col.key] = true;
          } else if (["false", "no", "0", "n"].includes(lower)) {
            data[col.key] = false;
          } else {
            errors.push(
              `"${col.label}" must be true/false (got "${trimmed}")`
            );
          }
          break;
        }

        case "enum": {
          const normalizedVal = trimmed
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
          const match = col.enumValues?.find(
            (ev) => ev.toLowerCase().replace(/[\s-]+/g, "_") === normalizedVal
          );
          if (!match) {
            errors.push(
              `"${col.label}" must be one of: ${col.enumValues?.join(", ")} (got "${trimmed}")`
            );
          } else {
            data[col.key] = match;
          }
          break;
        }

        case "fk_lookup": {
          const lookup = fkLookups.get(col.fkTable!);
          const normalizedLookup = trimmed.toLowerCase();
          let resolvedId: string | undefined;

          if (lookup) {
            for (const [displayVal, id] of lookup.entries()) {
              if (displayVal.toLowerCase() === normalizedLookup) {
                resolvedId = id;
                break;
              }
            }
          }

          if (col.required && !resolvedId) {
            errors.push(
              `"${col.label}": could not find matching ${col.fkTable} "${trimmed}"`
            );
          } else {
            data[col.key] = resolvedId ?? null;
          }
          break;
        }
      }
    }

    return {
      rowIndex: index + 1,
      data,
      errors,
      isValid: errors.length === 0,
    };
  });
}

function parseDateFlexible(value: string): string | null {
  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value + "T00:00:00");
    if (!isNaN(d.getTime())) return value;
  }

  // MM/DD/YYYY
  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    const dateStr = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    const date = new Date(dateStr + "T00:00:00");
    if (!isNaN(date.getTime())) return dateStr;
  }

  // Fallback
  const fallback = new Date(value);
  if (!isNaN(fallback.getTime())) {
    return fallback.toISOString().split("T")[0];
  }

  return null;
}
