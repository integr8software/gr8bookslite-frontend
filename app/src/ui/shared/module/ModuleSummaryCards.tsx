"use client";

import type { ComponentType, CSSProperties, ReactNode, SVGProps } from "react";
import { ReceiptText } from "lucide-react";
import { joinClasses } from "@/app/src/utils/string.util";

export type ModuleSummaryCardTone =
  | "amber"
  | "blue"
  | "cyan"
  | "green"
  | "orange"
  | "purple"
  | "rose"
  | "slate";

export type ModuleSummaryCardItem = {
  hasNoBorder?: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  isHighlighted?: boolean;
  label: string;
  tone: ModuleSummaryCardTone;
  value: string;
};

export type ModuleSummaryCardsProps = {
  cardClassName?: string;
  className?: string;
  gridClassName?: string;
  headerAction?: ReactNode;
  headerIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  isHeaderVisible?: boolean;
  items: ModuleSummaryCardItem[];
  minCardWidth?: string;
  title?: string;
};

export function ModuleSummaryCards({
  cardClassName,
  className,
  gridClassName,
  headerAction,
  headerIcon: HeaderIcon = ReceiptText,
  isHeaderVisible = true,
  items,
  minCardWidth = "10rem",
  title = "Module Summary",
}: ModuleSummaryCardsProps) {
  return (
    <div className={joinClasses("min-w-0 rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5", className)}>
      {isHeaderVisible ? (
        <div className="flex items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[rgb(var(--skyblue-rgb)/0.12)] text-[var(--skyblue)] ring-1 ring-[rgb(var(--skyblue-rgb)/0.25)]">
              <HeaderIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <h3 className="truncate text-sm font-bold text-darknavy">{title}</h3>
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      ) : null}
      <div
        className={joinClasses("grid min-w-0 gap-3 p-4", gridClassName)}
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))` }}
      >
        {items.map((item) => (
          <ModuleSummaryCard key={item.label} className={cardClassName} item={item} />
        ))}
      </div>
    </div>
  );
}

const ToneDefinitions: Record<
  ModuleSummaryCardTone,
  {
    cardBorder: string;
    cardHoverBorder: string;
    cardHighlightBorder: string;
    cardHighlightBg: string;
    cardHighlightRing: string;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    textColor: string;
  }
> = {
  green: {
    cardBorder: "#d1fae5",
    cardHoverBorder: "#10b981",
    cardHighlightBorder: "#059669",
    cardHighlightBg: "#ecfdf5",
    cardHighlightRing: "rgba(5, 150, 105, 0.25)",
    iconBg: "#d1fae5",
    iconColor: "#047857",
    iconBorder: "#a7f3d0",
    textColor: "#047857",
  },
  cyan: {
    cardBorder: "#cffafe",
    cardHoverBorder: "#06b6d4",
    cardHighlightBorder: "#0891b2",
    cardHighlightBg: "#ecfeff",
    cardHighlightRing: "rgba(8, 145, 178, 0.25)",
    iconBg: "#cffafe",
    iconColor: "#0e7490",
    iconBorder: "#a5f3fc",
    textColor: "#0e7490",
  },
  purple: {
    cardBorder: "#f3e8ff",
    cardHoverBorder: "#a855f7",
    cardHighlightBorder: "#9333ea",
    cardHighlightBg: "#faf5ff",
    cardHighlightRing: "rgba(147, 51, 234, 0.25)",
    iconBg: "#f3e8ff",
    iconColor: "#7c3aed",
    iconBorder: "#e9d5ff",
    textColor: "#7c3aed",
  },
  rose: {
    cardBorder: "#ffe4e6",
    cardHoverBorder: "#f43f5e",
    cardHighlightBorder: "#e11d48",
    cardHighlightBg: "#fff1f2",
    cardHighlightRing: "rgba(225, 29, 72, 0.25)",
    iconBg: "#ffe4e6",
    iconColor: "#be123c",
    iconBorder: "#fecdd3",
    textColor: "#be123c",
  },
  orange: {
    cardBorder: "#ffedd5",
    cardHoverBorder: "#f97316",
    cardHighlightBorder: "#ea580c",
    cardHighlightBg: "#fff7ed",
    cardHighlightRing: "rgba(234, 88, 12, 0.25)",
    iconBg: "#ffedd5",
    iconColor: "#c2410c",
    iconBorder: "#fed7aa",
    textColor: "#c2410c",
  },
  blue: {
    cardBorder: "#dbeafe",
    cardHoverBorder: "#3b82f6",
    cardHighlightBorder: "#2563eb",
    cardHighlightBg: "#eff6ff",
    cardHighlightRing: "rgba(37, 99, 235, 0.25)",
    iconBg: "#dbeafe",
    iconColor: "#1d4ed8",
    iconBorder: "#bfdbfe",
    textColor: "#1d4ed8",
  },
  amber: {
    cardBorder: "#fef3c7",
    cardHoverBorder: "#f59e0b",
    cardHighlightBorder: "#d97706",
    cardHighlightBg: "#fffbeb",
    cardHighlightRing: "rgba(217, 119, 6, 0.25)",
    iconBg: "#fef3c7",
    iconColor: "#b45309",
    iconBorder: "#fde68a",
    textColor: "#b45309",
  },
  slate: {
    cardBorder: "#e2e8f0",
    cardHoverBorder: "#94a3b8",
    cardHighlightBorder: "#64748b",
    cardHighlightBg: "#f8fafc",
    cardHighlightRing: "rgba(100, 116, 139, 0.25)",
    iconBg: "#f1f5f9",
    iconColor: "#475569",
    iconBorder: "#cbd5e1",
    textColor: "#334155",
  },
};

function ModuleSummaryCard({ className, item }: { className?: string; item: ModuleSummaryCardItem }) {
  const Icon = item.icon;
  const tone = ToneDefinitions[item.tone] ?? ToneDefinitions.blue;
  const hasNoBorder = Boolean(item.hasNoBorder);

  return (
    <div
      className={joinClasses(
        "group grid min-h-32 min-w-0 place-items-center gap-3 rounded-lg px-3 py-4 text-center transition",
        hasNoBorder
          ? "border-0 shadow-none bg-transparent"
          : item.isHighlighted
            ? "shadow-md ring-1"
            : "border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5 hover:shadow-md",
        className,
      )}
      style={
        hasNoBorder
          ? {
              backgroundColor: "transparent",
              border: "none",
              borderColor: "transparent",
              boxShadow: "none",
            }
          : {
              backgroundColor: item.isHighlighted ? tone.cardHighlightBg : "#ffffff",
              borderColor: item.isHighlighted ? tone.cardHighlightBorder : "rgba(33, 39, 56, 0.1)",
              boxShadow: item.isHighlighted
                ? `0 0 0 1px ${tone.cardHighlightRing}, 0 4px 6px -1px rgba(0, 0, 0, 0.05)`
                : undefined,
            }
      }
    >
      {Icon ? (
        <span
          className="flex h-11 w-11 items-center justify-center rounded-lg ring-1 transition group-hover:scale-105"
          style={{
            backgroundColor: tone.iconBg,
            color: tone.iconColor,
            borderColor: tone.iconBorder,
            boxShadow: `0 0 0 1px ${tone.iconBorder}`,
          }}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      ) : null}
      <div className="grid gap-2">
        <span className="text-xs font-bold text-darknavy">{item.label}</span>
        <span
          className="text-xl font-black tabular-nums transition"
          style={{ color: tone.textColor }}
        >
          {item.value}
        </span>
      </div>
    </div>
  );
}
