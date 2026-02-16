"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FileImage, Check, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface ExpenseTableProps {
  expenses: Expense[];
  categories: string[];
}

export function ExpenseTable({ expenses, categories }: ExpenseTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const filtered = expenses.filter((exp) => {
    const matchesSearch =
      (exp.description?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (exp.vendor?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCategory =
      categoryFilter === "all" || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const monthTotal = filtered.reduce((sum, exp) => sum + exp.amount, 0);

  // Group totals by category
  const categoryTotals = filtered.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthTotal)}</p>
          </CardContent>
        </Card>
        {Object.entries(categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([cat, total]) => (
            <Card key={cat}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium truncate">
                  {cat}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {expenses.length === 0
              ? "No expenses yet. Log your first business expense!"
              : "No expenses match your filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-10">Receipt</TableHead>
                <TableHead className="w-10 hidden sm:table-cell">
                  Deductible
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(exp.date)}
                  </TableCell>
                  <TableCell>{exp.description || "-"}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{exp.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {exp.vendor || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(exp.amount)}
                  </TableCell>
                  <TableCell>
                    {exp.receipt_url && (
                      <button
                        onClick={() => setReceiptUrl(exp.receipt_url)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <FileImage className="h-4 w-4" />
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {exp.is_tax_deductible ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Receipt Viewer */}
      <Dialog open={!!receiptUrl} onOpenChange={() => setReceiptUrl(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {receiptUrl && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptUrl}
                alt="Receipt"
                className="max-h-[70vh] object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
