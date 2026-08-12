"use client";

import type { ComponentType, CSSProperties, SVGProps } from "react";
import { ReceiptText } from "lucide-react";

export type TransactionSummaryCardTone = "blue" | "cyan" | "green" | "orange" | "purple";

export type TransactionSummaryCardItem = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isHighlighted?: boolean;
  label: string;
  tone: TransactionSummaryCardTone;
  value: string;
};

export function TransactionSummaryCards({
  items,
  title = "Transaction Summary",
}: {
  items: TransactionSummaryCardItem[];
  title?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
      <div className="flex items-center gap-3 border-b border-darknavy/10 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-[rgb(var(--skyblue-rgb)/0.12)] text-[var(--skyblue)] ring-1 ring-[rgb(var(--skyblue-rgb)/0.25)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-bold text-darknavy">{title}</h3>
      </div>
      <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3 p-4">
        {items.map((item) => (
          <TransactionSummaryCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

function TransactionSummaryCard({ item }: { item: TransactionSummaryCardItem }) {
  const Icon = item.icon;
  const toneStyle = getTransactionSummaryCardToneStyle(item.tone, item.isHighlighted);

  return (
    <div
      className={[
        "group grid min-h-32 min-w-0 place-items-center gap-3 rounded-lg border bg-white px-3 py-4 text-center shadow-sm transition",
        "hover:border-[var(--transaction-summary-tone)] hover:bg-[rgb(var(--transaction-summary-tone-rgb)/0.06)] hover:shadow-md hover:shadow-[rgb(var(--transaction-summary-tone-rgb)/0.12)]",
        item.isHighlighted
          ? "border-darknavy/10 bg-[rgb(var(--transaction-summary-tone-rgb)/0.06)] shadow-[rgb(var(--transaction-summary-tone-rgb)/0.12)]"
          : "border-darknavy/10 shadow-darknavy/5",
      ].join(" ")}
      style={toneStyle}
    >
      <span
        className={[
          "flex h-11 w-11 items-center justify-center rounded-lg bg-[rgb(var(--transaction-summary-tone-rgb)/0.12)] text-[var(--transaction-summary-tone)] ring-1 ring-[rgb(var(--transaction-summary-tone-rgb)/0.22)] transition",
          "group-hover:bg-[rgb(var(--transaction-summary-tone-rgb)/0.16)] group-hover:ring-[rgb(var(--transaction-summary-tone-rgb)/0.32)]",
        ].join(" ")}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="grid gap-2">
        <span className="text-xs font-bold text-darknavy">{item.label}</span>
        <span
          className={[
            "text-xl font-black text-[var(--transaction-summary-tone)] transition",
          ].join(" ")}
        >
          {item.value}
        </span>
      </div>
    </div>
  );
}

type TransactionSummaryCardStyle = CSSProperties & Record<`--${string}`, string>;

function getTransactionSummaryCardToneStyle(
  tone: TransactionSummaryCardTone,
  isHighlighted = false,
): TransactionSummaryCardStyle {
  if (tone === "purple" || isHighlighted) {
    return {
      "--transaction-summary-tone": "var(--skyblue)",
      "--transaction-summary-tone-rgb": "var(--skyblue-rgb)",
    };
  }

  const toneRgb = TransactionSummaryCardToneRgb[tone];

  return {
    "--transaction-summary-tone": `rgb(${toneRgb})`,
    "--transaction-summary-tone-rgb": toneRgb,
  };
}

const TransactionSummaryCardToneRgb: Record<
  Exclude<TransactionSummaryCardTone, "purple">,
  string
> = {
  blue: "37 99 235",
  cyan: "8 145 178",
  green: "5 150 105",
  orange: "234 88 12",
};
