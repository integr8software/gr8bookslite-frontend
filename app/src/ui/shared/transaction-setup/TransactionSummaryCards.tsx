"use client";

import {
  Calculator,
  HandCoins,
  Percent,
  Receipt,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  ModuleSummaryCards,
  type ModuleSummaryCardItem,
} from "@/app/src/ui/shared/module/ModuleSummaryCards";
import { formatAmount } from "@/app/src/utils/currency.util";

export type TransactionSummaryCardsProps = {
  className?: string;
  cwtAmount?: number | string;
  cwtRate?: number | string;
  ewtAmount?: number | string;
  ewtRate?: number | string;
  grossAmount?: number | string;
  netAmount?: number | string;
  taxLabelType?: "EWT" | "CWT";
  title?: string;
  vatAmount?: number | string;
  vatRate?: number | string;
};

function formatMoneyValue(value: number | string | undefined | null): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? formatAmount(value) : "0.00";
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? formatAmount(parsed) : value || "0.00";
  }
  return "0.00";
}

function formatRateValue(rate: number | string | undefined | null): string {
  if (rate === undefined || rate === null || rate === "") {
    return "0.00%";
  }
  if (typeof rate === "number") {
    return `${formatAmount(rate)}%`;
  }
  const str = String(rate).trim();
  return str.endsWith("%") ? str : `${str}%`;
}

/**
 * Predetermined 6-card summary surface for transaction modules that have header amounts
 * (Gross Amount, VAT, EWT/CWT) and NO Data Entry grid.
 *
 * Total of 6 cards:
 * 1. Gross Amount (Blue, Calculator)
 * 2. VAT Rate (Cyan, Percent)
 * 3. VAT Amount (Purple, Receipt)
 * 4. EWT / CWT Rate (Orange, TrendingDown)
 * 5. EWT / CWT Amount (Orange, HandCoins)
 * 6. Net Amount (Green, Wallet, isHighlighted)
 */
export function createTransactionSummaryCardItems({
  cwtAmount,
  cwtRate,
  ewtAmount,
  ewtRate,
  grossAmount = 0,
  netAmount = 0,
  taxLabelType = "EWT",
  vatAmount = 0,
  vatRate,
}: Omit<TransactionSummaryCardsProps, "className" | "title">): ModuleSummaryCardItem[] {
  const isCwt = taxLabelType === "CWT" || cwtAmount !== undefined || cwtRate !== undefined;
  const withholdingLabel = isCwt ? "CWT" : "EWT";
  const withholdingRate = cwtRate !== undefined ? cwtRate : ewtRate;
  const withholdingAmount = cwtAmount !== undefined ? cwtAmount : (ewtAmount ?? 0);

  return [
    {
      label: "Gross Amount",
      value: formatMoneyValue(grossAmount),
      tone: "green",
      icon: Calculator,
    },
    {
      label: "VAT Rate",
      value: formatRateValue(vatRate),
      tone: "cyan",
      icon: Percent,
    },
    {
      label: "VAT Amount",
      value: formatMoneyValue(vatAmount),
      tone: "purple",
      icon: Receipt,
    },
    {
      label: `${withholdingLabel} Rate`,
      value: formatRateValue(withholdingRate),
      tone: "slate",
      icon: TrendingDown,
    },
    {
      label: `${withholdingLabel} Amount`,
      value: formatMoneyValue(withholdingAmount),
      tone: "orange",
      icon: HandCoins,
    },
    {
      label: "Net Amount",
      value: formatMoneyValue(netAmount),
      tone: "blue",
      icon: Wallet,
    },
  ];
}

export function TransactionSummaryCards({
  className,
  cwtAmount,
  cwtRate,
  ewtAmount,
  ewtRate,
  grossAmount = 0,
  netAmount = 0,
  taxLabelType = "EWT",
  title = "Transaction Summary",
  vatAmount = 0,
  vatRate,
}: TransactionSummaryCardsProps) {
  const items = createTransactionSummaryCardItems({
    cwtAmount,
    cwtRate,
    ewtAmount,
    ewtRate,
    grossAmount,
    netAmount,
    taxLabelType,
    vatAmount,
    vatRate,
  });

  return (
    <ModuleSummaryCards
      className={className}
      items={items}
      title={title}
    />
  );
}
