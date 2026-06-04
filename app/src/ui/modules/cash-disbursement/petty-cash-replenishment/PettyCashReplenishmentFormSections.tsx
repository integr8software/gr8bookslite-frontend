import { ChevronDown, Plus, Save, X } from "lucide-react";
import {
	PettyCashReplenishmentCopySources,
	PettyCashReplenishmentFormStatusOptions,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentConstants";
import type {
	PettyCashReplenishmentEntry,
	PettyCashReplenishmentStatus,
} from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";
import {
	buttonBaseClassName,
	Field,
	inputClassName,
	outlineButtonClassName,
	ReadOnlyTotal,
	secondaryButtonClassName,
	type PettyCashReplenishmentFormPageState,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentFormControls";

const tableHeaderClassName = "border-b border-darknavy/10 px-3 py-3";
const tableCellClassName = "px-3 py-3";

export function PettyCashReplenishmentToolbar({
	onCancel,
	page,
}: {
	onCancel: () => void;
	page: PettyCashReplenishmentFormPageState;
}) {
	return (
		<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
			<div>
				<p className="text-sm font-semibold text-darknavy/80">
					Replenishment Report
				</p>
				<p className="mt-1 text-sm text-darknavy/60">
					Complete the main details and entries for the petty cash
					replenishment record.
				</p>
			</div>
			<div className="relative flex flex-wrap items-center gap-3">
				{!page.isReadonly ? (
					<PettyCashReplenishmentCopyFromMenu page={page} />
				) : null}
				<button
					type="button"
					onClick={onCancel}
					className={secondaryButtonClassName}
				>
					<X className="h-4 w-4" />
					{page.isReadonly ? "Close" : "Cancel"}
				</button>
				{!page.isReadonly ? (
					<button
						type="button"
						onClick={page.handleSubmit}
						className={`${buttonBaseClassName} bg-darknavy text-white hover:bg-darknavy/90`}
					>
						<Save className="h-4 w-4" />
						Save
					</button>
				) : null}
			</div>
		</div>
	);
}

export function PettyCashReplenishmentDetailsFields({
	page,
}: {
	page: PettyCashReplenishmentFormPageState;
}) {
	return (
		<div className="rounded-3xl border border-darknavy/10 bg-offwhite/80 p-6">
			<div className="grid gap-6 sm:grid-cols-2">
				<Field label="VCE Code *" error={page.errors.vceCode}>
					<input
						value={page.values.vceCode}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("vceCode", event.target.value)
						}
						className={inputClassName}
						placeholder="Enter VCE code"
					/>
				</Field>
				<Field label="VCE Name *" error={page.errors.vceName}>
					<input
						value={page.values.vceName}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("vceName", event.target.value)
						}
						className={inputClassName}
						placeholder="Enter VCE name"
					/>
				</Field>
				<Field label="Remarks" error={page.errors.remarks}>
					<textarea
						value={page.values.remarks}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("remarks", event.target.value)
						}
						className={`${inputClassName} min-h-28 resize-none py-3`}
						placeholder="Optional remarks"
					/>
				</Field>
			</div>
		</div>
	);
}

export function PettyCashReplenishmentSummaryFields({
	page,
}: {
	page: PettyCashReplenishmentFormPageState;
}) {
	return (
		<aside className="space-y-5 rounded-3xl border border-darknavy/10 bg-offwhite/80 p-6">
			<div className="grid gap-4">
				<ReadOnlyTotal
					label="Total Amount"
					value={page.totals.totalAmount}
				/>
				<ReadOnlyTotal
					label="VAT Amount"
					value={page.totals.vatAmount}
				/>
				<ReadOnlyTotal
					label="Net Amount"
					value={page.totals.netAmount}
				/>
			</div>

			<div className="grid gap-4">
				<Field label="Trans No. *" error={page.errors.transNo}>
					<input
						value={page.values.transNo}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("transNo", event.target.value)
						}
						className={`${inputClassName} app-select-control`}
						placeholder="Enter transaction number"
					/>
				</Field>
				<Field label="Document Date" error={page.errors.documentDate}>
					<input
						type="date"
						value={page.values.documentDate}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("documentDate", event.target.value)
						}
						className={inputClassName}
					/>
				</Field>
				<Field label="Status" error={page.errors.status}>
					<select
						value={page.values.status}
						disabled={page.isReadonly}
						onChange={(event) =>
							page.updateField(
								"status",
								event.target
									.value as PettyCashReplenishmentStatus,
							)
						}
						className={inputClassName}
					>
						{PettyCashReplenishmentFormStatusOptions.map(
							(status) => (
								<option key={status}>{status}</option>
							),
						)}
					</select>
				</Field>
				<Field label="Project Ref" error={page.errors.projectRef}>
					<input
						value={page.values.projectRef}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("projectRef", event.target.value)
						}
						className={inputClassName}
						placeholder="Project reference"
					/>
				</Field>
				<Field label="Project Name" error={page.errors.projectName}>
					<input
						value={page.values.projectName}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("projectName", event.target.value)
						}
						className={inputClassName}
						placeholder="Project name"
					/>
				</Field>
			</div>
		</aside>
	);
}

export function PettyCashReplenishmentEntriesTable({
	page,
}: {
	page: PettyCashReplenishmentFormPageState;
}) {
	return (
		<div className="rounded-3xl border border-darknavy/10 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center justify-between gap-3">
				<div>
					<p className="text-lg font-semibold text-darknavy">
						Entries
					</p>
					<p className="mt-1 text-sm text-darknavy/60">
						Add or edit the underlying petty cash expense rows for
						this replenishment.
					</p>
					{page.errors.entries ? (
						<p className="mt-2 text-sm font-semibold text-red-500">
							{page.errors.entries}
						</p>
					) : null}
				</div>
				{!page.isReadonly ? (
					<button
						type="button"
						onClick={page.addEntry}
						className={outlineButtonClassName}
					>
						<Plus className="h-4 w-4" />
						Add row
					</button>
				) : null}
			</div>

			<div className="overflow-x-auto">
				<table className="min-w-full border-separate border-spacing-0 text-sm text-darknavy">
					<PettyCashReplenishmentEntriesHeader />
					<tbody>
						{page.entries.map((entry, index) => (
							<PettyCashReplenishmentEntryRow
								key={entry.id}
								entry={entry}
								index={index}
								isReadonly={page.isReadonly}
								updateEntry={page.updateEntry}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function PettyCashReplenishmentCopyFromMenu({
	page,
}: {
	page: PettyCashReplenishmentFormPageState;
}) {
	return (
		<div className="relative inline-flex">
			<button
				type="button"
				onClick={() => page.setCopyFromOpen((current) => !current)}
				className={secondaryButtonClassName}
				aria-expanded={page.copyFromOpen}
				aria-haspopup="menu"
			>
				Copy From
				<ChevronDown className="h-4 w-4" />
			</button>
			{page.copyFromOpen ? (
				<div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-darknavy/10 bg-white shadow-lg">
					{PettyCashReplenishmentCopySources.map((source, index) => (
						<button
							key={source}
							type="button"
							onClick={() => page.openCopyFrom(source)}
							className={[
								"w-full px-4 py-3 text-left text-sm text-darknavy",
								"transition hover:bg-skyblue/10",
								index ===
								PettyCashReplenishmentCopySources.length - 1
									? "rounded-b-xl"
									: "",
							].join(" ")}
						>
							{source}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}

function PettyCashReplenishmentEntriesHeader() {
	return (
		<thead className="bg-skyblue/10 text-left text-xs uppercase tracking-[0.12em] text-darknavy/70">
			<tr>
				<th className={tableHeaderClassName}>No.</th>
				<th className={tableHeaderClassName}>Petty Cash Date</th>
				<th className={tableHeaderClassName}>Petty Cash No.</th>
				<th className={tableHeaderClassName}>Code</th>
				<th className={tableHeaderClassName}>Name</th>
				<th className={tableHeaderClassName}>Total Amount</th>
				<th className={tableHeaderClassName}>Net Amount</th>
				<th className={tableHeaderClassName}>VAT Amount</th>
				<th className={tableHeaderClassName}>Remarks</th>
			</tr>
		</thead>
	);
}

function PettyCashReplenishmentEntryRow({
	entry,
	index,
	isReadonly,
	updateEntry,
}: {
	entry: PettyCashReplenishmentEntry;
	index: number;
	isReadonly: boolean;
	updateEntry: (
		entryId: string,
		field: keyof PettyCashReplenishmentEntry,
		value: string,
	) => void;
}) {
	return (
		<tr className="border-b border-darknavy/10 last:border-b-0">
			<td className="px-3 py-3 text-sm font-semibold text-darknavy/80">
				{index + 1}
			</td>
			<EntryInputCell
				entry={entry}
				field="pettyCashDate"
				isReadonly={isReadonly}
				type="date"
				updateEntry={updateEntry}
			/>
			<EntryInputCell
				entry={entry}
				field="pettyCashNo"
				isReadonly={isReadonly}
				placeholder="Enter ref"
				updateEntry={updateEntry}
			/>
			<EntryInputCell
				entry={entry}
				field="code"
				isReadonly={isReadonly}
				placeholder="Enter code"
				updateEntry={updateEntry}
			/>
			<EntryInputCell
				entry={entry}
				field="name"
				isReadonly={isReadonly}
				placeholder="Enter name"
				updateEntry={updateEntry}
			/>
			<EntryInputCell
				entry={entry}
				field="totalAmount"
				isReadonly={isReadonly}
				placeholder="0.00"
				updateEntry={updateEntry}
			/>
			<EntryInputCell
				entry={entry}
				field="netAmount"
				isReadonly={isReadonly}
				placeholder="0.00"
				updateEntry={updateEntry}
			/>
			<EntryInputCell
				entry={entry}
				field="vatAmount"
				isReadonly={isReadonly}
				placeholder="0.00"
				updateEntry={updateEntry}
			/>
			<EntryInputCell
				entry={entry}
				field="remarks"
				isReadonly={isReadonly}
				placeholder="Remarks"
				updateEntry={updateEntry}
			/>
		</tr>
	);
}

function EntryInputCell({
	entry,
	field,
	isReadonly,
	placeholder,
	type = "text",
	updateEntry,
}: {
	entry: PettyCashReplenishmentEntry;
	field: keyof PettyCashReplenishmentEntry;
	isReadonly: boolean;
	placeholder?: string;
	type?: string;
	updateEntry: (
		entryId: string,
		field: keyof PettyCashReplenishmentEntry,
		value: string,
	) => void;
}) {
	return (
		<td className={tableCellClassName}>
			<input
				type={type}
				value={entry[field]}
				readOnly={isReadonly}
				onChange={(event) =>
					updateEntry(entry.id, field, event.target.value)
				}
				className={inputClassName}
				placeholder={placeholder}
			/>
		</td>
	);
}
