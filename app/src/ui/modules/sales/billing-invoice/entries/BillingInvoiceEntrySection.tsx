import type { ReactNode } from "react";
import {
	BillingInvoiceEntryExportOptions,
	BillingInvoiceEntryTabs,
} from "@/app/src/constants/modules/sales/billing-invoice/BillingInvoiceEntryConstants";
import { formatBillingInvoiceAmount } from "@/app/src/data/modules/sales/billing-invoice/BillingInvoiceData";
import {
	useBillingInvoiceAccountEntries,
	useBillingInvoiceEntryTabs,
	useBillingInvoiceItemEntries,
} from "@/app/src/hooks/modules/sales/billing-invoice/useBillingInvoiceEntries";
import type {
	BillingInvoiceAccountEntry,
	BillingInvoiceEntriesTab,
	BillingInvoiceLineEntry,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type BillingInvoiceEntrySectionProps = {
	accountRows: BillingInvoiceAccountEntry[];
	isReadonly: boolean;
	rows: BillingInvoiceLineEntry[];
	onAccountRowsChange: (rows: BillingInvoiceAccountEntry[]) => void;
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void;
};

export function BillingInvoiceEntrySection({
	accountRows,
	isReadonly,
	onAccountRowsChange,
	onRowsChange,
	rows,
}: BillingInvoiceEntrySectionProps) {
	const [activeTab, setActiveTab] = useBillingInvoiceEntryTabs();
	const tabs = (
		<BillingInvoiceEntryTabsControl
			activeTab={activeTab}
			onTabChange={setActiveTab}
		/>
	);

	if (activeTab === "accounts") {
		return (
			<BillingInvoiceAccountEntries
				isReadonly={isReadonly}
				rows={accountRows}
				title={tabs}
				onRowsChange={onAccountRowsChange}
			/>
		);
	}

	return (
		<BillingInvoiceItemEntries
			isReadonly={isReadonly}
			rows={rows}
			title={tabs}
			onRowsChange={onRowsChange}
		/>
	);
}

function BillingInvoiceEntryTabsControl({
	activeTab,
	onTabChange,
}: {
	activeTab: BillingInvoiceEntriesTab;
	onTabChange: (tab: BillingInvoiceEntriesTab) => void;
}) {
	return (
		<div
			role="tablist"
			aria-label="Billing invoice row entry sections"
			className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
		>
			{BillingInvoiceEntryTabs.map((tab) => {
				const isActive = activeTab === tab.id;

				return (
					<button
						key={tab.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						className={joinClasses(
							"h-7 rounded-md px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
							isActive
								? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
								: "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
						)}
						onClick={() => onTabChange(tab.id)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}

function BillingInvoiceItemEntries({
	isReadonly,
	onRowsChange,
	rows,
	title,
}: {
	isReadonly: boolean;
	rows: BillingInvoiceLineEntry[];
	title: ReactNode;
	onRowsChange: (rows: BillingInvoiceLineEntry[]) => void;
}) {
	const entryState = useBillingInvoiceItemEntries({
		isReadonly,
		onRowsChange,
		rows,
	});

	return (
		<ModuleDataEntry
			columns={entryState.columns}
			columnOptions={entryState.columnOptions}
			description=""
			emptyRowLabel="item"
			exportOptions={BillingInvoiceEntryExportOptions}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			title={title}
			onAddRows={entryState.handleAddRows}
			onAutoColumnWidth={() => undefined}
			onClearRows={entryState.handleClearRows}
			onDuplicateRow={entryState.handleDuplicateRow}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={entryState.handleInsertRow}
			onMoveRow={entryState.handleMoveRow}
			onRemoveRow={entryState.handleRemoveRow}
			onToggleColumnVisibility={() => undefined}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}

function BillingInvoiceAccountEntries({
	isReadonly,
	onRowsChange,
	rows,
	title,
}: {
	isReadonly: boolean;
	rows: BillingInvoiceAccountEntry[];
	title: ReactNode;
	onRowsChange: (rows: BillingInvoiceAccountEntry[]) => void;
}) {
	const entryState = useBillingInvoiceAccountEntries({
		isReadonly,
		onRowsChange,
		rows,
	});
	const isBalanced = entryState.totals.debit === entryState.totals.credit;

	return (
		<ModuleDataEntry
			columns={entryState.columns}
			columnOptions={entryState.columnOptions}
			description=""
			emptyRowLabel="account"
			exportOptions={BillingInvoiceEntryExportOptions}
			footerDetails={
				<span
					className={joinClasses(
						"text-sm font-semibold",
						isBalanced ? "text-emerald-700" : "text-red-600",
					)}
				>
					Difference:{" "}
					{formatBillingInvoiceAmount(
						Math.abs(entryState.totals.debit - entryState.totals.credit),
					)}
				</span>
			}
			isDraggable
			isReadonly={isReadonly}
			rows={rows}
			summaryCells={{
				credit: formatBillingInvoiceAmount(entryState.totals.credit),
				debit: formatBillingInvoiceAmount(entryState.totals.debit),
			}}
			summaryRowHeader="Totals"
			title={title}
			onAddRows={entryState.handleAddRows}
			onAutoColumnWidth={() => undefined}
			onClearRows={entryState.handleClearRows}
			onDuplicateRow={entryState.handleDuplicateRow}
			onFitColumnWidth={() => undefined}
			onImport={() => undefined}
			onInsertRow={entryState.handleInsertRow}
			onMoveRow={entryState.handleMoveRow}
			onRemoveRow={entryState.handleRemoveRow}
			onToggleColumnVisibility={entryState.handleToggleColumnVisibility}
			onUpdateColumnHeader={() => undefined}
			onUpdateColumnWidth={() => undefined}
		/>
	);
}
