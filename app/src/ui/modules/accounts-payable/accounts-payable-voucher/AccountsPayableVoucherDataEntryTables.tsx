"use client";

import { useState } from "react";
import { AccountsPayableVoucherAccountingTable } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherAccountingTable";
import { AccountsPayableVoucherExpenseTable } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherExpenseTable";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type {
  AccountsPayableVoucherDataEntryTablesProps,
  AccountsPayableVoucherEntryView,
} from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTableTypes";

export type { AccountsPayableVoucherPartyAddTarget } from "@/app/src/ui/modules/accounts-payable/accounts-payable-voucher/AccountsPayableVoucherDataEntryTableTypes";

export function AccountsPayableVoucherDataEntryTables({
  canAddPartyName,
  onAddPartyName,
  page,
}: AccountsPayableVoucherDataEntryTablesProps) {
  const [entryView, setEntryView] = useState<AccountsPayableVoucherEntryView>("expense");
  const title = <EntryViewTabs entryView={entryView} onEntryViewChange={setEntryView} />;

  return entryView === "expense" ? (
    <AccountsPayableVoucherExpenseTable canAddPartyName={canAddPartyName} onAddPartyName={onAddPartyName} page={page} title={title} />
  ) : (
    <AccountsPayableVoucherAccountingTable canAddPartyName={canAddPartyName} onAddPartyName={onAddPartyName} page={page} title={title} />
  );
}

function EntryViewTabs({
  entryView,
  onEntryViewChange,
}: {
  entryView: AccountsPayableVoucherEntryView;
  onEntryViewChange: (entryView: AccountsPayableVoucherEntryView) => void;
}) {
  return (
    <div role="tablist" aria-label="Entry view" className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1">
      {(
        [
          ["expense", "Payable Details"],
          ["accounting", "Accounting Entries"],
        ] as const
      ).map(([view, label]) => {
        const isActive = entryView === view;

        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onEntryViewChange(view)}
            className={joinClasses(
              "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
              isActive
                ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
