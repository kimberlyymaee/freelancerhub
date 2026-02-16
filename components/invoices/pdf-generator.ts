import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, InvoiceItem, Payment, Profile } from "@/lib/types";

type InvoiceWithRelations = Invoice & {
  client?: {
    company_name: string;
    email: string | null;
    address: string | null;
    contact_name: string | null;
  } | null;
  items: InvoiceItem[];
  payments: Payment[];
};

export async function generateInvoicePdf(
  invoice: InvoiceWithRelations,
  profile: Profile | null
) {
  // Use jsPDF for simpler client-side PDF generation
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - 20, y, { align: "right" });

  // Business info
  doc.setFontSize(12);
  doc.text(
    profile?.business_name || profile?.full_name || "FreelanceHub",
    20,
    y
  );
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  if (profile?.email) {
    doc.text(profile.email, 20, y);
    y += 4;
  }
  if (profile?.phone) {
    doc.text(profile.phone, 20, y);
    y += 4;
  }
  if (profile?.address) {
    const addressLines = profile.address.split("\n");
    addressLines.forEach((line) => {
      doc.text(line, 20, y);
      y += 4;
    });
  }
  if (profile?.tax_id_tin) {
    doc.text(`TIN: ${profile.tax_id_tin}`, 20, y);
    y += 4;
  }

  // Invoice number & dates on the right
  let rightY = 28;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.invoice_number, pageWidth - 20, rightY, {
    align: "right",
  });
  rightY += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Issue Date: ${formatDate(invoice.issue_date)}`, pageWidth - 20, rightY, {
    align: "right",
  });
  rightY += 4;
  if (invoice.due_date) {
    doc.text(`Due Date: ${formatDate(invoice.due_date)}`, pageWidth - 20, rightY, {
      align: "right",
    });
    rightY += 4;
  }

  y = Math.max(y, rightY) + 10;

  // Bill To
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 20, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(invoice.client?.company_name ?? "—", 20, y);
  y += 4;
  if (invoice.client?.contact_name) {
    doc.text(invoice.client.contact_name, 20, y);
    y += 4;
  }
  if (invoice.client?.email) {
    doc.text(invoice.client.email, 20, y);
    y += 4;
  }
  if (invoice.client?.address) {
    const lines = invoice.client.address.split("\n");
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 4;
    });
  }

  y += 8;

  // Table header
  doc.setFillColor(245, 245, 245);
  doc.rect(20, y - 4, pageWidth - 40, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Description", 22, y);
  doc.text("Qty", 120, y, { align: "right" });
  doc.text("Unit Price", 145, y, { align: "right" });
  doc.text("Amount", pageWidth - 22, y, { align: "right" });
  y += 6;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  invoice.items.forEach((item) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text(item.description.substring(0, 50), 22, y);
    doc.text(item.quantity.toString(), 120, y, { align: "right" });
    doc.text(formatCurrency(item.unit_price), 145, y, { align: "right" });
    doc.text(formatCurrency(item.amount), pageWidth - 22, y, {
      align: "right",
    });
    y += 5;
  });

  y += 4;
  doc.setDrawColor(200);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  // Totals
  doc.setFontSize(9);
  doc.text("Subtotal:", 130, y);
  doc.text(formatCurrency(invoice.subtotal), pageWidth - 22, y, {
    align: "right",
  });
  y += 5;

  if (invoice.tax_amount > 0) {
    doc.text(`Tax (${(invoice.tax_rate * 100).toFixed(1)}%):`, 130, y);
    doc.text(formatCurrency(invoice.tax_amount), pageWidth - 22, y, {
      align: "right",
    });
    y += 5;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total:", 130, y);
  doc.text(formatCurrency(invoice.total), pageWidth - 22, y, {
    align: "right",
  });
  y += 8;

  // Payment info
  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  if (totalPaid > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Paid:", 130, y);
    doc.text(`- ${formatCurrency(totalPaid)}`, pageWidth - 22, y, {
      align: "right",
    });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Balance Due:", 130, y);
    doc.text(
      formatCurrency(invoice.total - totalPaid),
      pageWidth - 22,
      y,
      { align: "right" }
    );
    y += 8;
  }

  // Notes
  if (invoice.notes) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Notes:", 20, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(noteLines, 20, y);
    y += noteLines.length * 4;
  }

  // Payment terms
  if (invoice.payment_terms) {
    y += 4;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text(`Terms: ${invoice.payment_terms}`, 20, y);
  }

  // Download
  doc.save(`${invoice.invoice_number}.pdf`);
}
