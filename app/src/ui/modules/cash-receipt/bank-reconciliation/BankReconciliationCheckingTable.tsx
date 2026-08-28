"use client";

import { useMemo, useState } from "react";
import { Sparkles, Search } from "lucide-react";
import { BankReconciliationTabs } from "@/app/src/constants/modules/cash-receipt/bank-reconciliation/BankReconciliationConstants";
import { formatBankReconciliationAmount } from "@/app/src/data/modules/cash-receipt/bank-reconciliation/BankReconciliationData";
import type { useBankReconciliationFormPage } from "@/app/src/hooks/modules/cash-receipt/bank-reconciliation/useBankReconciliationFormPage";

type BankReconciliationCheckingTableProps = {
  page: ReturnType<typeof useBankReconciliationFormPage>;
};

export function BankReconciliationCheckingTable({
  page,
}: BankReconciliationCheckingTableProps) {
  const [localSearch, setLocalSearch] = useState("");

  const itemsForActiveTab = useMemo(() => {
    return page.values.checkingItems.filter((item) => {
      if (page.activeTab === "deposit-in-transit") {
        return item.itemType === "deposit" && !item.isCleared;
      }
      if (page.activeTab === "outstanding-checks") {
        return item.itemType === "check" && !item.isCleared;
      }
      if (page.activeTab === "cleared") {
        return item.isCleared;
      }
      return true;
    });
  }, [page.values.checkingItems, page.activeTab]);

  const filteredItems = useMemo(() => {
    if (!localSearch.trim()) return itemsForActiveTab;

    const query = localSearch.toLowerCase().trim();
    return itemsForActiveTab.filter(
      (item) =>
        item.vceName.toLowerCase().includes(query) ||
        item.transNo.toLowerCase().includes(query) ||
        (item.checkNo && item.checkNo.toLowerCase().includes(query)) ||
        item.refType.toLowerCase().includes(query) ||
        String(item.amount).includes(query),
    );
  }, [itemsForActiveTab, localSearch]);

  const allFilteredIds = useMemo(
    () => filteredItems.map((item) => item.id),
    [filteredItems],
  );
  const isAllSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => page.selectedItemIds.has(id));

  const showCheckNo =
    page.activeTab === "outstanding-checks" || page.activeTab === "cleared";

  const counts = useMemo(() => {
    const dit = page.values.checkingItems.filter(
      (i) => i.itemType === "deposit" && !i.isCleared,
    ).length;
    const oc = page.values.checkingItems.filter(
      (i) => i.itemType === "check" && !i.isCleared,
    ).length;
    const cleared = page.values.checkingItems.filter((i) => i.isCleared).length;
    return { dit, oc, cleared };
  }, [page.values.checkingItems]);

  const autoMatchedCount = useMemo(() => {
    return page.values.checkingItems.filter((i) => i.isCleared && i.isAutoMatched)
      .length;
  }, [page.values.checkingItems]);

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-bold text-darknavy">
        Reconcile Checking
      </h2>

      {/* Tabs */}
      <div
        role="tablist"
        className="flex flex-wrap gap-2 border-b border-darknavy/10 pb-2"
      >
        {BankReconciliationTabs.map((tab) => {
          const isActive = page.activeTab === tab.key;
          const count =
            tab.key === "deposit-in-transit"
              ? counts.dit
              : tab.key === "outstanding-checks"
                ? counts.oc
                : counts.cleared;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                page.setActiveTab(tab.key);
              }}
              className={`rounded-t-md px-4 py-2 text-xs font-bold transition ${
                isActive
                  ? "border-b-2 border-skyblue bg-offwhite/50 text-skyblue"
                  : "text-darknavy/70 hover:bg-offwhite hover:text-darknavy"
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Toolbar: Action button on left, search on right */}
      <div className="my-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {page.activeTab === "cleared" ? (
            <button
              type="button"
              onClick={page.handleUnclearSelected}
              disabled={page.isReadonly || page.selectedItemIds.size === 0}
              className="inline-flex h-9 items-center justify-center rounded-md bg-skyblue px-4 text-xs font-semibold text-white transition hover:bg-skyblue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Unclear
            </button>
          ) : (
            <button
              type="button"
              onClick={page.handleClearSelected}
              disabled={page.isReadonly || page.selectedItemIds.size === 0}
              className="inline-flex h-9 items-center justify-center rounded-md bg-skyblue px-4 text-xs font-semibold text-white transition hover:bg-skyblue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[16rem]">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search VCEName/TransNo/Amount"
              className="h-9 w-full rounded-md border border-darknavy/15 bg-white px-3 pr-8 text-xs font-medium text-darknavy outline-none placeholder:text-darknavy/35 focus:border-skyblue/50 focus:ring-2 focus:ring-skyblue/15"
            />
            <Search className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-darknavy/40" />
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-skyblue px-3 text-xs font-semibold text-white transition hover:bg-skyblue/90"
          >
            Search
          </button>
        </div>
      </div>

      {/* Checking Table */}
      <div className="overflow-x-auto rounded-md border border-darknavy/10">
        <table className="w-full text-left text-xs text-darknavy">
          <thead className="bg-skyblue text-white font-semibold">
            <tr>
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  disabled={page.isReadonly || filteredItems.length === 0}
                  onChange={(e) =>
                    page.toggleSelectAll(allFilteredIds, e.target.checked)
                  }
                  className="rounded border-white/40 text-skyblue focus:ring-white/20"
                />
              </th>
              <th className="px-3 py-2.5">AppDate</th>
              <th className="px-3 py-2.5">VCEName</th>
              <th className="px-3 py-2.5">RefType</th>
              <th className="px-3 py-2.5">TransNo</th>
              {showCheckNo && <th className="px-3 py-2.5">CheckNo</th>}
              <th className="px-3 py-2.5">Remarks</th>
              <th className="px-3 py-2.5 text-right">Amount</th>
              <th className="px-3 py-2.5 text-center">Transacted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darknavy/8 bg-white">
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={showCheckNo ? 9 : 8}
                  className="py-8 text-center text-xs font-medium text-darknavy/50"
                >
                  No Records Found
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isSelected = page.selectedItemIds.has(item.id);

                return (
                  <tr
                    key={item.id}
                    className={`transition hover:bg-offwhite/50 ${
                      isSelected ? "bg-skyblue/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={page.isReadonly}
                        onChange={() => page.toggleSelectRow(item.id)}
                        className="rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium">
                      {item.appDate}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{item.vceName}</td>
                    <td className="px-3 py-2.5">{item.refType}</td>
                    <td className="px-3 py-2.5 font-mono">{item.transNo}</td>
                    {showCheckNo && (
                      <td className="px-3 py-2.5 font-mono">
                        {item.checkNo || "-"}
                      </td>
                    )}
                    <td className="max-w-[14rem] truncate px-3 py-2.5 text-darknavy/70">
                      {item.remarks || "-"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium tabular-nums">
                      {formatBankReconciliationAmount(item.amount)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        {item.transacted || "Yes"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Automatically Matched Records badge */}
      {autoMatchedCount > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
          <Sparkles className="h-4 w-4" />
          <span>
            Automatically Matched Records: {autoMatchedCount} items cleared from statement upload
          </span>
        </div>
      )}
    </section>
  );
}
