import type { ImportConfig } from "../types";

export const clientImportConfig: ImportConfig = {
  entityName: "clients",
  entityLabel: "Clients",
  entityLabelSingular: "Client",
  tableName: "clients",
  templateFileName: "clients_import_template.csv",
  columns: [
    {
      key: "company_name",
      label: "Company Name",
      required: true,
      type: "string",
      aliases: ["company", "name", "business_name", "business"],
    },
    {
      key: "contact_name",
      label: "Contact Name",
      required: false,
      type: "string",
      aliases: ["contact", "contact_person", "person"],
    },
    {
      key: "email",
      label: "Email",
      required: false,
      type: "string",
      aliases: ["email_address", "e-mail"],
    },
    {
      key: "phone",
      label: "Phone",
      required: false,
      type: "string",
      aliases: ["phone_number", "telephone", "tel", "mobile"],
    },
    {
      key: "address",
      label: "Address",
      required: false,
      type: "string",
      aliases: ["location", "office_address"],
    },
    {
      key: "status",
      label: "Status",
      required: false,
      type: "enum",
      enumValues: ["active", "on_hold", "completed", "prospect"],
      defaultValue: "active",
      aliases: ["client_status"],
    },
    {
      key: "tags",
      label: "Tags",
      required: false,
      type: "string",
      aliases: ["labels", "categories"],
    },
    {
      key: "notes",
      label: "Notes",
      required: false,
      type: "string",
      aliases: ["comments", "remarks"],
    },
  ],
};
