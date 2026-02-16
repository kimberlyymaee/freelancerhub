import {
  TAX_BRACKETS,
  TAX_EXEMPTION_AMOUNT,
  EIGHT_PERCENT_RATE,
  PERCENTAGE_TAX_RATE,
  VAT_THRESHOLD,
} from "./constants";
import type { TaxResult, TaxComparison, VatThresholdStatus } from "./types";

/**
 * 8% Income Tax (TRAIN Law)
 * Tax Due = (Gross Sales/Receipts - 250,000) x 8%
 */
export function calculate8PercentTax(
  grossRevenue: number,
  exemption: number = TAX_EXEMPTION_AMOUNT
): TaxResult {
  const taxableAmount = Math.max(0, grossRevenue - exemption);
  const taxDue = taxableAmount * EIGHT_PERCENT_RATE;
  return { taxableAmount, taxDue };
}

/**
 * Graduated Income Tax (TRAIN Law 2025)
 * Uses bracket table. Input is net taxable income (revenue - expenses).
 */
export function calculateGraduatedTax(netTaxableIncome: number): TaxResult {
  if (netTaxableIncome <= 0) {
    return { taxableAmount: 0, taxDue: 0 };
  }

  let taxDue = 0;
  for (const bracket of TAX_BRACKETS) {
    if (netTaxableIncome >= bracket.min && netTaxableIncome <= bracket.max) {
      taxDue =
        bracket.base + (netTaxableIncome - bracket.min + 1) * bracket.rate;
      break;
    }
  }

  return { taxableAmount: netTaxableIncome, taxDue: Math.max(0, taxDue) };
}

/**
 * 3% Percentage Tax on gross sales (for graduated rate taxpayers)
 */
export function calculatePercentageTax(grossRevenue: number): number {
  return grossRevenue * PERCENTAGE_TAX_RATE;
}

/**
 * Compare both tax regimes side by side
 */
export function compareTaxRegimes(
  grossRevenue: number,
  totalExpenses: number
): TaxComparison {
  const result8Pct = calculate8PercentTax(grossRevenue);
  const totalTax8Pct = result8Pct.taxDue;

  const netIncome = Math.max(0, grossRevenue - totalExpenses);
  const resultGraduated = calculateGraduatedTax(netIncome);
  const percentageTaxGraduated = calculatePercentageTax(grossRevenue);
  const totalTaxGraduated = resultGraduated.taxDue + percentageTaxGraduated;

  const recommendation =
    totalTax8Pct <= totalTaxGraduated ? "eight_percent" : "graduated";
  const savings = Math.abs(totalTax8Pct - totalTaxGraduated);

  return {
    grossRevenue,
    totalExpenses,
    exemption8Pct: TAX_EXEMPTION_AMOUNT,
    taxableAmount8Pct: result8Pct.taxableAmount,
    taxDue8Pct: result8Pct.taxDue,
    percentageTax8Pct: 0,
    totalTax8Pct,
    taxableAmountGraduated: netIncome,
    incomeTaxGraduated: resultGraduated.taxDue,
    percentageTaxGraduated,
    totalTaxGraduated,
    recommendation,
    savings,
  };
}

export function getQuarterFromDate(date: Date): 1 | 2 | 3 | 4 {
  const month = date.getMonth();
  if (month <= 2) return 1;
  if (month <= 5) return 2;
  if (month <= 8) return 3;
  return 4;
}

export function getQuarterDeadline(year: number, quarter: number): Date {
  switch (quarter) {
    case 1:
      return new Date(year, 4, 15);
    case 2:
      return new Date(year, 7, 15);
    case 3:
      return new Date(year, 10, 15);
    case 4:
      return new Date(year + 1, 3, 15);
    default:
      return new Date(year, 4, 15);
  }
}

export function calculateQuarterlyTax8Pct(
  ytdRevenue: number,
  previousQuartersTaxPaid: number
): number {
  const result = calculate8PercentTax(ytdRevenue);
  return Math.max(0, result.taxDue - previousQuartersTaxPaid);
}

export function getVatThresholdStatus(
  grossRevenue: number,
  threshold: number = VAT_THRESHOLD
): VatThresholdStatus {
  const percentage = (grossRevenue / threshold) * 100;
  let level: VatThresholdStatus["level"] = "safe";

  if (percentage >= 90) {
    level = "danger";
  } else if (percentage >= 80) {
    level = "warning";
  }

  return { currentRevenue: grossRevenue, threshold, percentage, level };
}
