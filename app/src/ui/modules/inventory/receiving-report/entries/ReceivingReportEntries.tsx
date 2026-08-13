"use client";

import { useState } from "react";
import { ReceivingReportAccountingEntries } from "@/app/src/ui/modules/inventory/receiving-report/entries/ReceivingReportAccountingEntries";
import { ReceivingReportEntryTabs } from "@/app/src/ui/modules/inventory/receiving-report/entries/ReceivingReportEntryTabs";
import { ReceivingReportItemEntries } from "@/app/src/ui/modules/inventory/receiving-report/entries/ReceivingReportItemEntries";
import type {
  ReceivingReportAccountingEntry,
  ReceivingReportAccountingEntryUpdater,
  ReceivingReportEntryTab,
  ReceivingReportEntryUpdater,
  ReceivingReportLine,
  ReceivingReportTotals,
} from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function ReceivingReportEntries({
  accountingEntries,
  error,
  isReadonly,
  onAccountingRowsChange,
  onRowsChange,
  onUpdateAccountingEntry,
  onUpdateLine,
  rows,
  totals,
}: {
  accountingEntries: ReceivingReportAccountingEntry[];
  error?: string;
  isReadonly: boolean;
  onAccountingRowsChange: (rows: ReceivingReportAccountingEntry[]) => void;
  onRowsChange: (rows: ReceivingReportLine[]) => void;
  onUpdateAccountingEntry: ReceivingReportAccountingEntryUpdater;
  onUpdateLine: ReceivingReportEntryUpdater;
  rows: ReceivingReportLine[];
  totals: ReceivingReportTotals;
}) {
  const [activeEntryTab, setActiveEntryTab] = useState<ReceivingReportEntryTab>("items");
  const tabs = (
    <ReceivingReportEntryTabs activeTab={activeEntryTab} onTabChange={setActiveEntryTab} />
  );

  if (activeEntryTab === "accounting") {
    return (
      <ReceivingReportAccountingEntries
        isReadonly={isReadonly}
        rows={accountingEntries}
        title={tabs}
        onRowsChange={onAccountingRowsChange}
        onUpdateEntry={onUpdateAccountingEntry}
      />
    );
  }

  return (
    <ReceivingReportItemEntries
      error={error}
      isReadonly={isReadonly}
      rows={rows}
      title={tabs}
      totals={totals}
      onRowsChange={onRowsChange}
      onUpdateLine={onUpdateLine}
    />
  );
}
