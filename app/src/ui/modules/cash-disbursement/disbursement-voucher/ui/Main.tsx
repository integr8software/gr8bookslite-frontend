"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	useDisbursementVoucherPreviewTable,
	useDisbursementVoucherStore,
} from "@/app/src/hooks/modules/cash-disbursement/disbursement-voucher/useDisbursementVoucher";
import {
	createDisbursementTransactionFromForm,
	createDisbursementVoucherFromForm,
	updateDisbursementVoucherFromForm,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import type {
	DisbursementVoucherFormValues,
	DisbursementVoucherPreviewRow,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
	clearAccountingGridSession,
	readAccountingGridSession,
	type DisbursementVoucherAccountingGridSession,
} from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/AccountingGridSession";
import { DisbursementVoucherDrawer } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherDrawer";
import { DisbursementVoucherHeader } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherHeader";
import { DisbursementVoucherTable } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/ui/DisbursementVoucherTable";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

type DrawerState = {
	mode: "add" | "edit";
	row?: DisbursementVoucherPreviewRow;
	resumeState?: DisbursementVoucherAccountingGridSession | null;
} | null;

export function DisbursementVoucherMain() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const transactions = useDisbursementVoucherStore(
		(state) => state.transactions,
	);
	const vouchers = useDisbursementVoucherStore((state) => state.vouchers);
	const previewRows = useDisbursementVoucherStore(
		(state) => state.previewRows,
	);
	const addTransaction = useDisbursementVoucherStore(
		(state) => state.addTransaction,
	);
	const updateTransaction = useDisbursementVoucherStore(
		(state) => state.updateTransaction,
	);
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

	useEffect(() => {
		if (searchParams.get("grid") !== "resume") {
			return;
		}

		const resumeState = readAccountingGridSession();

		if (!resumeState) {
			router.replace("/cash-disbursement/disbursement-voucher");
			return;
		}

		const restoreTimer = window.setTimeout(() => {
			setDrawerState({
				mode: resumeState.mode,
				resumeState,
			});
			clearAccountingGridSession();
			router.replace("/cash-disbursement/disbursement-voucher");
		}, 0);

		return () => window.clearTimeout(restoreTimer);
	}, [router, searchParams]);

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
		const existingTransaction = transactions.find(
			(transaction) => transaction.id === values.transactionId,
		);
		const nextTransaction = createDisbursementTransactionFromForm(
			values,
			existingTransaction,
		);
		const nextValues = {
			...values,
			transactionId: nextTransaction.id,
		};
		const existingVoucher =
			drawerVoucher ??
			vouchers.find(
				(voucher) => voucher.transactionId === nextTransaction.id,
			);

		if (existingTransaction) {
			updateTransaction(nextTransaction);
		} else {
			addTransaction(nextTransaction);
		}

		if (drawerState?.mode === "edit" && existingVoucher) {
			updateVoucher(
				updateDisbursementVoucherFromForm(existingVoucher, nextValues),
			);
			return;
		}

		if (existingVoucher) {
			updateVoucher(
				updateDisbursementVoucherFromForm(existingVoucher, nextValues),
			);
			return;
		}

		addVoucher(createDisbursementVoucherFromForm(nextValues));
	}

	const drawerTransactionId = drawerState?.row?.transaction.id;
	const resumeTransactionId = drawerState?.resumeState?.values.transactionId;
	const activeTransactionId = resumeTransactionId || drawerTransactionId;
	const drawerTransaction = activeTransactionId
		? transactions.find(
				(transaction) => transaction.id === activeTransactionId,
			)
		: undefined;
	const drawerVoucher = activeTransactionId
		? vouchers.find(
				(voucher) => voucher.transactionId === activeTransactionId,
			)
		: undefined;

	return (
		<>
			<section className="-mx-3 -my-4 min-h-[calc(100dvh-5rem)] bg-white text-darknavy sm:-mx-5 lg:-mx-6">
				<main className="grid min-h-[calc(100dvh-5rem)] content-start gap-5 p-4 sm:p-6">
					<DisbursementVoucherHeader
						previewRows={previewRows}
						onStartVoucher={() => setDrawerState({ mode: "add" })}
					/>

					<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
						<div className="border-b border-darknavy/10 px-4 py-4 sm:px-5 sm:py-5">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
								<div className="max-w-2xl min-w-0">
									<p className="text-xs font-semibold uppercase tracking-[0.24em] text-darknavy/40">
										Search Transaction
									</p>
									<h3 className="mt-2 text-xl font-semibold leading-tight text-darknavy sm:text-2xl">
										Preview the transaction set before
										creating a voucher
									</h3>
									<p className="mt-2 text-sm leading-6 text-darknavy/58">
										Search by payee, voucher number,
										remarks, or transaction number, then
										move directly into Preview, New Voucher,
										Edit Voucher, or Delete.
									</p>
								</div>
							</div>
						</div>

						<DisbursementVoucherTable
							onCreateVoucher={(row) =>
								setDrawerState({ mode: "add", row })
							}
							onEditVoucher={(row) =>
								setDrawerState({ mode: "edit", row })
							}
							table={previewTable.table}
							toolbar={
								<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none sm:grid-cols-2 xl:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]">
									<ModuleTableSearch
										label="Search disbursement voucher transactions"
										value={previewTable.query}
										onChange={previewTable.setQuery}
										placeholder="Search by transaction number, payee, department, or remarks..."
									/>
									<ModuleTableFilterSelect
										label="Status"
										value={previewTable.statusFilter}
										options={previewTable.statusOptions.map(
											(status) => ({
												label: status,
												value: status,
											}),
										)}
										onChange={(value) =>
											previewTable.setStatusFilter(
												value as (typeof previewTable.statusOptions)[number],
											)
										}
									/>
									<ModuleTableResetButton
										onClick={previewTable.resetFilters}
									>
										Reset
									</ModuleTableResetButton>
								</ModuleTableToolbar>
							}
							onDeleteVoucher={setPendingDeleteRow}
						/>
					</div>
				</main>
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
				resumeState={drawerState?.resumeState}
				transaction={drawerTransaction}
				transactions={transactions}
				voucher={drawerVoucher}
				onClose={handleCloseDrawer}
				onSave={handleSaveDrawer}
			/>
		</>
	);
}
