import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "PHP"
): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MM/dd/yyyy");
}

export function generateInvoiceNumber(
  lastNumber: string | null,
  prefix: string = "INV"
): string {
  const year = new Date().getFullYear();
  if (!lastNumber) {
    return `${prefix}-${year}-001`;
  }

  const parts = lastNumber.split("-");
  const seq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = (seq + 1).toString().padStart(3, "0");
  return `${prefix}-${year}-${nextSeq}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
