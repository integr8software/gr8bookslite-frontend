"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Download, Edit3, Eye, Plus, Trash2, Upload } from "lucide-react";
import { TransactionTypeHref, TransactionTypeStatusOptions } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import { useTransactionTypeStore } from "@/app/src/hooks/modules/maintenance/financial-management/transaction-type/useTransactionType";
import type { TransactionType } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";
import { AppDialog } from "@/app/src/ui/shared/system/AppDialog";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function FinancialManagementTransactionTypeMain() {
	const transactionTypes = useTransactionTypeStore((state) => state.transactionTypes);
	const updateTransactionType = useTransactionTypeStore(
		(state) => state.updateTransactionType,
	);
	const deleteTransactionType = useTransactionTypeStore((state) => state.deleteTransactionType);
	const isLoading = useTransactionTypeStore((state) => state.isLoading);
	const isMutating = useTransactionTypeStore((state) => state.isMutating);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"" | typeof TransactionTypeStatusOptions[number]>("");
	const [pendingStatusTransactionType, setPendingStatusTransactionType] = useState<TransactionType | null>(null);
	const [pendingDeleteTransactionType, setPendingDeleteTransactionType] = useState<TransactionType | null>(null);

	const filteredTransactionTypes = useMemo(() => {
		return transactionTypes.filter((transactionType) => {
			const matchesSearch = [
				transactionType.type,
				transactionType.description,
				transactionType.accountCode,
				transactionType.accountTitle,
			]
				.join(" ")
				.toLowerCase()
				.includes(searchTerm.trim().toLowerCase());

			const matchesStatus =
				!statusFilter || transactionType.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [searchTerm, statusFilter, transactionTypes]);

	function handleConfirmStatusChange() {
		if (!pendingStatusTransactionType) {
			return;
		}

		const nextStatus =
			pendingStatusTransactionType.status === "Active"
				? "Inactive"
				: "Active";

		updateTransactionType({
			...pendingStatusTransactionType,
			status: nextStatus,
		});
		setPendingStatusTransactionType(null);
	}

	function handleConfirmDelete() {
		if (!pendingDeleteTransactionType) {
			return;
		}

		deleteTransactionType(pendingDeleteTransactionType.id);
		setPendingDeleteTransactionType(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Transaction Type"
				description="Maintain transaction types used for posting, accounting, and reporting flows."
				eyebrow={
					<>
						<Upload className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={
					<>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Upload className="h-4 w-4" aria-hidden="true" />
							Import
						</button>
						<button
							type="button"
							className={moduleHeaderActionClassNames.secondary}
						>
							<Download className="h-4 w-4" aria-hidden="true" />
							Export
						</button>
						<Link
							href={`${TransactionTypeHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Transaction Type
						</Link>
					</>
				}
			/>

			<div className="flex flex-col gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div className="flex-1">
					<label className="block text-sm font-semibold text-darknavy">
						Search
						<input
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Search by type, description, or account"
							className="mt-2 min-w-0 w-full rounded-md border border-darknavy/15 bg-white px-3 py-2 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
						/>
					</label>
				</div>
				<div className="min-w-42.5">
					<label className="block text-sm font-semibold text-darknavy">
						Status
						<select
							value={statusFilter}
							onChange={(event) => setStatusFilter(event.target.value as "" | typeof TransactionTypeStatusOptions[number])}
							className="mt-2 min-w-full rounded-md border border-darknavy/15 bg-white px-3 py-2 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
						>
							<option value="">All statuses</option>
							{TransactionTypeStatusOptions.map((statusOption) => (
								<option key={statusOption} value={statusOption}>
									{statusOption}
								</option>
							))}
						</select>
					</label>
				</div>
			</div>

			<div className="overflow-x-auto rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<table className="min-w-full divide-y divide-darknavy/10 text-sm text-darknavy">
					<thead className="bg-darknavy/5 text-left text-xs uppercase tracking-wide text-darknavy/70">
						<tr>
							<th className="px-4 py-3">Type</th>
							<th className="px-4 py-3">Description</th>
							<th className="px-4 py-3">Account Code</th>
							<th className="px-4 py-3">Account Title</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{isLoading ? (
							<TransactionTypeTableMessage>
								Loading transaction types...
							</TransactionTypeTableMessage>
						) : null}
						{!isLoading && filteredTransactionTypes.length === 0 ? (
							<TransactionTypeTableMessage>
								No transaction types found.
							</TransactionTypeTableMessage>
						) : null}
						{!isLoading
							? filteredTransactionTypes.map((transactionType) => (
								<TransactionTypeTableRow
									key={transactionType.id}
									transactionType={transactionType}
									onStatusChange={setPendingStatusTransactionType}
									onDeleteTransactionType={setPendingDeleteTransactionType}
								/>
								))
							: null}
					</tbody>
				</table>
			</div>

			<AppDialog
				isOpen={Boolean(pendingStatusTransactionType)}
				isPending={isMutating}
				title={
					pendingStatusTransactionType?.status === "Active"
						? "Set transaction type inactive?"
						: "Set transaction type active?"
				}
				description={`This will set ${pendingStatusTransactionType?.description ?? "the selected transaction type"} to ${
					pendingStatusTransactionType?.status === "Active" ? "Inactive" : "Active"
				}.`}
				confirmLabel={
					pendingStatusTransactionType?.status === "Active"
						? "Set Inactive"
						: "Set Active"
				}
				tone="danger"
				onCancel={() => setPendingStatusTransactionType(null)}
				onConfirm={handleConfirmStatusChange}
			/>
			<AppDialog
				isOpen={Boolean(pendingDeleteTransactionType)}
				isPending={isMutating}
				title="Delete transaction type?"
				description={`This will remove ${pendingDeleteTransactionType?.description ?? "the selected transaction type"}.`}
				confirmLabel="Delete Transaction Type"
				tone="danger"
				onCancel={() => setPendingDeleteTransactionType(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}

function TransactionTypeTableRow({
	transactionType,
	onStatusChange,
	onDeleteTransactionType,
}: {
	transactionType: TransactionType;
	onStatusChange: (transactionType: TransactionType) => void;
	onDeleteTransactionType: (transactionType: TransactionType) => void;
}) {
	return (
		<tr>
			<td className="px-4 py-4 font-medium">{transactionType.type}</td>
			<td className="px-4 py-4">{transactionType.description}</td>
			<td className="px-4 py-4">{transactionType.accountCode}</td>
			<td className="px-4 py-4">{transactionType.accountTitle}</td>
			<td className="px-4 py-4">{transactionType.status}</td>
			<td className="px-4 py-4">
				<div className="flex flex-wrap items-center gap-2">
					<Link
						href={`${TransactionTypeHref}/view/${transactionType.id}`}
						aria-label={`View ${transactionType.description}`}
						className={tableActionClassName}
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
					</Link>
					<Link
						href={`${TransactionTypeHref}/edit/${transactionType.id}`}
						aria-label={`Edit ${transactionType.description}`}
						className={tableActionClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					</Link>
					<button
						type="button"
						onClick={() => onDeleteTransactionType(transactionType)}
						aria-label={`Delete ${transactionType.description}`}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				
				</div>
			</td>
		</tr>
	);
}

function TransactionTypeTableMessage({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<tr>
			<td colSpan={6} className="px-4 py-6 text-center text-sm text-darknavy/60">
				{children}
			</td>
		</tr>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";

