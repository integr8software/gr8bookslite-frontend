"use client";

import { useState } from "react";
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
import { DisbursementVoucherDrawer } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherDrawer";
import { DisbursementVoucherHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherHeader";
import { DisbursementVoucherTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherTable";
import {
  ModuleTableResetButton,
  ModuleTableFilterSelect,
  ModuleTableSearch,
  ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";

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
          </div>

          <div className="mt-6">
              <DisbursementVoucherTable
              onCreateVoucher={(row) => setDrawerState({ mode: "add", row })}
              onEditVoucher={(row) => setDrawerState({ mode: "edit", row })}
              table={previewTable.table}
              toolbar={
                <ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]">
                  <ModuleTableSearch
                    label="Search disbursement voucher transactions"
                    value={previewTable.query}
                    onChange={previewTable.setQuery}
                    placeholder="Search by transaction number, payee, department, or remarks..."
                  />
                  <ModuleTableFilterSelect
                    label="Status"
                    value={previewTable.statusFilter}
                    options={previewTable.statusOptions.map((status) => ({
                      label: status,
                      value: status,
                    }))}
                    onChange={(value) =>
                      previewTable.setStatusFilter(
                        value as (typeof previewTable.statusOptions)[number],
                      )
                    }
                  />
                  <ModuleTableResetButton onClick={previewTable.resetFilters}>
                    Reset
                  </ModuleTableResetButton>
                </ModuleTableToolbar>
              }
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

