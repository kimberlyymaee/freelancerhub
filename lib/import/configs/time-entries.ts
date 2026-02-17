import type { ImportConfig } from "../types";

export const timeEntryImportConfig: ImportConfig = {
  entityName: "time_entries",
  entityLabel: "Time Entries",
  entityLabelSingular: "Time Entry",
  tableName: "time_entries",
  templateFileName: "time_entries_import_template.csv",
  columns: [
    {
      key: "project_id",
      label: "Project",
      required: true,
      type: "fk_lookup",
      fkTable: "projects",
      fkDisplayField: "name",
      fkIdField: "id",
      aliases: ["project", "project_name"],
    },
    {
      key: "date",
      label: "Date",
      required: true,
      type: "date",
      aliases: ["work_date", "entry_date"],
    },
    {
      key: "hours",
      label: "Hours",
      required: true,
      type: "number",
      aliases: ["duration", "time", "worked_hours"],
    },
    {
      key: "description",
      label: "Description",
      required: false,
      type: "string",
      aliases: ["task", "work_description", "notes", "details"],
    },
    {
      key: "is_billable",
      label: "Billable",
      required: false,
      type: "boolean",
      defaultValue: true,
      aliases: ["billable", "is_billable"],
    },
  ],
};
