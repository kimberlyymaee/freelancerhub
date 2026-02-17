import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv" || ext === "tsv") {
    return parseCsv(file);
  } else if (ext === "xlsx" || ext === "xls") {
    return parseExcel(file);
  }

  throw new Error(
    `Unsupported file format: .${ext}. Please use .csv or .xlsx files.`
  );
}

function parseCsv(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      complete(results) {
        resolve({
          headers: results.meta.fields ?? [],
          rows: results.data as Record<string, string>[],
        });
      },
      error(err: Error) {
        reject(new Error("Failed to parse CSV: " + err.message));
      },
    });
  });
}

async function parseExcel(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  if (jsonData.length === 0) {
    throw new Error("The uploaded file contains no data rows.");
  }

  const headers = Object.keys(jsonData[0]).map((h) => h.trim());
  const rows = jsonData.map((row) => {
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      cleaned[key.trim()] = String(value).trim();
    }
    return cleaned;
  });

  return { headers, rows };
}
