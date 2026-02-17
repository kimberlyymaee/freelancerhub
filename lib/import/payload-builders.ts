import type { BuildPayloadFn } from "./types";

const payloadBuilders: Record<string, BuildPayloadFn> = {
  clients(row, userId) {
    return {
      user_id: userId,
      company_name: row.company_name,
      contact_name: row.contact_name || null,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
      status: row.status || "active",
      tags: row.tags
        ? String(row.tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      notes: row.notes || null,
    };
  },

  projects(row, userId) {
    return {
      user_id: userId,
      name: row.name,
      client_id: row.client_id || null,
      type: row.type || "hourly",
      rate: row.rate ?? null,
      estimated_hours: row.estimated_hours ?? null,
      deadline: row.deadline || null,
      status: row.status || "not_started",
      description: row.description || null,
    };
  },

  time_entries(row, userId) {
    return {
      user_id: userId,
      project_id: row.project_id,
      date: row.date,
      hours: row.hours,
      description: row.description || null,
      is_billable: row.is_billable ?? true,
    };
  },

  expenses(row, userId) {
    return {
      user_id: userId,
      amount: row.amount,
      date: row.date,
      category: row.category,
      vendor: row.vendor || null,
      description: row.description || null,
      payment_method: row.payment_method || null,
      receipt_url: null,
      is_tax_deductible: row.is_tax_deductible ?? true,
      project_id: row.project_id || null,
    };
  },
};

export function getPayloadBuilder(entityName: string): BuildPayloadFn {
  const builder = payloadBuilders[entityName];
  if (!builder) {
    throw new Error(`No payload builder registered for "${entityName}"`);
  }
  return builder;
}
