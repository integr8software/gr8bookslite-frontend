"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import {
  useDisbursementVoucherPreviewTable,
  useDisbursementVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import {
  createDisbursementVoucherFromForm,
  updateDisbursementVoucherFromForm,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import type {
  DisbursementVoucherFormValues,
  DisbursementVoucherPreviewRow,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { DisbursementVoucherDrawer } from "./DisbursementVoucherDrawer";
import { DisbursementVoucherHeader } from "./DisbursementVoucherHeader";
import { DisbursementVoucherTable } from "./DisbursementVoucherTable";

type DrawerState = {
  mode: "add" | "edit";
  row?: DisbursementVoucherPreviewRow;
} | null;

export function DisbursementVoucherMain() {
  const transactions = useDisbursementVoucherStore(
    (state) => state.transactions,
  );
  const vouchers = useDisbursementVoucherStore((state) => state.vouchers);
  const previewRows = useDisbursementVoucherStore((state) => state.previewRows);
  const addVoucher = useDisbursementVoucherStore((state) => state.addVoucher);
  const updateVoucher = useDisbursementVoucherStore(
    (state) => state.updateVoucher,
  );
  const deleteVoucher = useDisbursementVoucherStore(
    (state) => state.deleteVoucher,
  );
  const isMutating = useDisbursementVoucherStore((state) => state.isMutating);
  const [pendingDeleteRow, setPendingDeleteRow] =
    useState<DisbursementVoucherPreviewRow | null>(null);
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const previewTable = useDisbursementVoucherPreviewTable(previewRows);
  const visibleRows = useMemo(
    () => previewTable.table.getRowModel().rows.map((row) => row.original),
    [previewTable.table],
  );

  function handleConfirmDelete() {
    if (!pendingDeleteRow?.voucher) {
      return;
    }

    deleteVoucher(pendingDeleteRow.voucher.id);
    setPendingDeleteRow(null);
  }

  function handleCloseDrawer() {
    setDrawerState(null);
  }

  function handleSaveDrawer(values: DisbursementVoucherFormValues) {
    if (drawerState?.mode === "edit" && drawerState.row?.voucher) {
      updateVoucher(
        updateDisbursementVoucherFromForm(drawerState.row.voucher, values),
      );
      return;
    }

    addVoucher(createDisbursementVoucherFromForm(values));
  }

  const drawerTransactionId = drawerState?.row?.transaction.id;
  const drawerTransaction = drawerTransactionId
    ? transactions.find((transaction) => transaction.id === drawerTransactionId)
    : undefined;
  const drawerVoucher = drawerTransactionId
    ? vouchers.find((voucher) => voucher.transactionId === drawerTransactionId)
    : undefined;

  return (
    <>
      <section className="grid gap-6">
        <DisbursementVoucherHeader
          previewRows={previewRows}
          onStartVoucher={() => setDrawerState({ mode: "add" })}
        />

        <div className="rounded-[28px] border border-darknavy/10 bg-white p-5 shadow-[0_18px_60px_rgba(33,39,56,0.08)] lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
                Search Transaction
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-darknavy">
                Preview the transaction set before creating a voucher
              </h3>
              <p className="mt-2 text-sm leading-6 text-darknavy/58">
                Search by payee, voucher number, remarks, or transaction number,
                then move directly into Preview, New Voucher, Edit Voucher, or
                Delete.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {previewTable.statusOptions.map((status) => {
                const isActive = previewTable.statusFilter === status;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => previewTable.setStatusFilter(status)}
                    className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                      isActive
                        ? "bg-darknavy text-white shadow-md shadow-darknavy/10"
                        : "border border-darknavy/10 bg-white text-darknavy/65 hover:border-skyblue/40"
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative block flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35" />
              <input
                type="search"
                value={previewTable.query}
                onChange={(event) => previewTable.setQuery(event.target.value)}
                placeholder="Search by transaction number, payee, department, or remarks..."
                className="h-12 w-full rounded-full border border-darknavy/12 bg-offwhite/60 pl-11 pr-4 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white"
              />
            </label>
            <button
              type="button"
              onClick={previewTable.resetFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-darknavy/12 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:border-skyblue/40"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset Search
            </button>
          </div>

          <div className="mt-6">
            <DisbursementVoucherTable
              onCreateVoucher={(row) => setDrawerState({ mode: "add", row })}
              onEditVoucher={(row) => setDrawerState({ mode: "edit", row })}
              rows={visibleRows}
              table={previewTable.table}
              onDeleteVoucher={setPendingDeleteRow}
            />
          </div>
        </div>
      </section>

      <AppDialog
        isOpen={Boolean(pendingDeleteRow)}
        isPending={isMutating}
        title="Delete linked voucher?"
        description={`This will remove ${pendingDeleteRow?.voucher?.voucherNo ?? "the selected voucher"} from ${pendingDeleteRow?.transaction.payee ?? "the selected transaction"}.`}
        confirmLabel="Delete Voucher"
        tone="danger"
        onCancel={() => setPendingDeleteRow(null)}
        onConfirm={handleConfirmDelete}
      />
      <DisbursementVoucherDrawer
        isOpen={Boolean(drawerState)}
        mode={drawerState?.mode ?? "add"}
        transaction={drawerTransaction}
        transactions={transactions}
        voucher={drawerVoucher}
        onClose={handleCloseDrawer}
        onSave={handleSaveDrawer}
      />
    </>
  );
}
