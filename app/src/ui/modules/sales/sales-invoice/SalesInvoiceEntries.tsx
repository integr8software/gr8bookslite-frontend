import { useState } from "react";
import type {
  SalesInvoiceAccountEntry,
  SalesInvoiceLineItem,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { SalesInvoiceAccountEntryTable } from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceAccountEntryTable";
import {
  SalesInvoiceEntryTabs,
  type SalesInvoiceEntriesTab,
} from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntryTabs";
import { SalesInvoiceItemEntryTable } from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceItemEntryTable";

type SalesInvoiceEntriesProps = {
  accountRows: SalesInvoiceAccountEntry[];
  isReadonly: boolean;
  rows: SalesInvoiceLineItem[];
  onAccountRowsChange: (rows: SalesInvoiceAccountEntry[]) => void;
  onRowsChange: (rows: SalesInvoiceLineItem[]) => void;
};

export function SalesInvoiceEntries({
  accountRows,
  isReadonly,
  onAccountRowsChange,
  onRowsChange,
  rows,
}: SalesInvoiceEntriesProps) {
  const [activeTab, setActiveTab] = useState<SalesInvoiceEntriesTab>("items");
  const tabs = (
    <SalesInvoiceEntryTabs activeTab={activeTab} onTabChange={setActiveTab} />
  );

  if (activeTab === "accounts") {
    return (
      <SalesInvoiceAccountEntryTable
        isReadonly={isReadonly}
        rows={accountRows}
        title={tabs}
        onRowsChange={onAccountRowsChange}
      />
    );
  }

  return (
    <SalesInvoiceItemEntryTable
      isReadonly={isReadonly}
      rows={rows}
      title={tabs}
      onRowsChange={onRowsChange}
    />
  );
}
