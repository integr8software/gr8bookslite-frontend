"use client";

import {
	BankMasterfileAccountTypeOptions,
} from "@/app/src/constants/modules/maintenance/bank-masterfile/BankMasterfileConstants";
import type {
	BankImportColumnId,
	BankImportPreviewRow,
	BankImportRowProps,
} from "@/app/src/types/modules/maintenance/bank-masterfile/BankMasterfileTypes";
import { rowHasBankImportErrors } from "@/app/src/validations/modules/maintenance/bank-masterfile/BankMasterfileValidation";
import { AlertCircle } from "lucide-react";
import { ModuleImportCellIssueIcon } from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function BankImportRow({
	row,
	selected,
	disabled,
	onToggle,
	onUpdate,
}: BankImportRowProps) {
	return (
		<>
		<tr className={rowHasBankImportErrors(row) ? "bg-coralpink/[0.025]" : undefined}>
			<td className="sticky left-0 z-20 bg-inherit px-2 py-2">
				<input
					type="checkbox"
					checked={selected}
					disabled={disabled}
					onChange={(event) => onToggle(row.id, event.target.checked)}
					aria-label={`Select row ${row.rowNumber}`}
					className="h-4 w-4 rounded accent-skyblue"
				/>
			</td>
			<EditableCell
				row={row}
				field="bankName"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="branch"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="accountNumber"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableSelect
				row={row}
				field="accountType"
				options={BankMasterfileAccountTypeOptions}
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="currencyCode"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="currencyExchangeRate"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="seriesStart"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="seriesEnd"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableCell
				row={row}
				field="seriesDigits"
				disabled={disabled}
				onUpdate={onUpdate}
			/>
		</tr>
		{row.rowErrors.length > 0 ? (
			<tr className="bg-coralpink/[0.025]">
				<td />
				<td
					colSpan={9}
					className="px-2 pb-3 text-xs font-semibold text-coralpink"
				>
					<span className="inline-flex items-start gap-1.5">
						<AlertCircle
							className="mt-0.5 h-3.5 w-3.5 shrink-0"
							aria-hidden="true"
						/>
						<span>{row.rowErrors.join(" ")}</span>
					</span>
				</td>
			</tr>
		) : null}
		</>
	);
}

function EditableCell({
	row,
	field,
	disabled,
	onUpdate,
}: {
	row: BankImportPreviewRow;
	field: Exclude<BankImportColumnId, "accountType" | "isDefault" | "status">;
	disabled: boolean;
	onUpdate: (rowId: string, field: BankImportColumnId, value: string) => void;
}) {
	const errors = row.cellErrors[field];

	return (
		<td className="px-1 py-1 align-top">
			<label className="relative block">
			<input
				value={String(row.values[field])}
				disabled={disabled}
				onChange={(event) => onUpdate(row.id, field, event.target.value)}
				title={errors?.join(" ")}
				className={joinClasses(
					"h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm outline-none focus:border-skyblue",
					errors?.length ? "pr-9" : "",
					errors?.length ? "border-coralpink/60" : "border-darknavy/10",
				)}
			/>
			<ModuleImportCellIssueIcon errors={errors} />
			</label>
		</td>
	);
}

function EditableSelect({
	row,
	field,
	options,
	disabled,
	onUpdate,
}: {
	row: BankImportPreviewRow;
	field: "accountType";
	options: readonly string[];
	disabled: boolean;
	onUpdate: (
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) => void;
}) {
	const value = String(row.values[field]);
	const errors = row.cellErrors[field];

	return (
		<td className="px-1 py-1 align-top">
			<label className="relative block">
			<select
				value={value}
				disabled={disabled}
				onChange={(event) => onUpdate(row.id, field, event.target.value)}
				title={errors?.join(" ")}
				className={joinClasses(
					"h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm outline-none focus:border-skyblue",
					errors?.length ? "pr-9" : "",
					errors?.length ? "border-coralpink/60" : "border-darknavy/10",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			<ModuleImportCellIssueIcon errors={errors} />
			</label>
		</td>
	);
}