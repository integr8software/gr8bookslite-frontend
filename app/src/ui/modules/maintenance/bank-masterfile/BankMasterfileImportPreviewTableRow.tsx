"use client";

import {
	BankMasterfileAccountTypeOptions,
	BankMasterfileStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import type {
	BankImportColumnId,
	BankImportPreviewRow,
} from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileImportTypes";
import { rowHasErrors } from "@/app/src/ui/modules/maintenance/bank-masterfile/BankMasterfileImportUtils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function BankImportRow({
	row,
	selected,
	disabled,
	onToggle,
	onUpdate,
}: {
	row: BankImportPreviewRow;
	selected: boolean;
	disabled: boolean;
	onToggle: (rowId: string, selected: boolean) => void;
	onUpdate: (
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) => void;
}) {
	return (
		<tr className={rowHasErrors(row) ? "bg-coralpink/[0.025]" : undefined}>
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
			<EditableSelect
				row={row}
				field="isDefault"
				options={["No", "Yes"]}
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<EditableSelect
				row={row}
				field="status"
				options={BankMasterfileStatusOptions}
				disabled={disabled}
				onUpdate={onUpdate}
			/>
			<td className="px-2 py-2 align-top text-xs">
				{rowHasErrors(row) ? (
					<span className="font-medium text-coralpink">
						{[...row.rowErrors, ...Object.values(row.cellErrors).flat()].join(
							" ",
						)}
					</span>
				) : (
					<span className="font-semibold text-emerald-700">Valid</span>
				)}
			</td>
		</tr>
	);
}

function EditableCell({
	row,
	field,
	disabled,
	onUpdate,
}: {
	row: BankImportPreviewRow;
	field: Exclude<BankImportColumnId, "isDefault" | "status">;
	disabled: boolean;
	onUpdate: (rowId: string, field: BankImportColumnId, value: string) => void;
}) {
	const errors = row.cellErrors[field];

	return (
		<td className="px-1 py-1 align-top">
			<input
				value={String(row.values[field])}
				disabled={disabled}
				onChange={(event) => onUpdate(row.id, field, event.target.value)}
				title={errors?.join(" ")}
				className={joinClasses(
					"h-9 w-full min-w-32 rounded-md border bg-white px-2 text-sm outline-none focus:border-skyblue",
					errors?.length ? "border-coralpink/60" : "border-darknavy/10",
				)}
			/>
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
	field: "accountType" | "isDefault" | "status";
	options: readonly string[];
	disabled: boolean;
	onUpdate: (
		rowId: string,
		field: BankImportColumnId,
		value: string | boolean,
	) => void;
}) {
	const value =
		field === "isDefault"
			? row.values.isDefault
				? "Yes"
				: "No"
			: String(row.values[field]);
	const errors = row.cellErrors[field];

	return (
		<td className="px-1 py-1 align-top">
			<select
				value={value}
				disabled={disabled}
				onChange={(event) => onUpdate(row.id, field, event.target.value)}
				title={errors?.join(" ")}
				className={joinClasses(
					"h-9 w-full min-w-32 rounded-md border bg-white px-2 text-sm outline-none focus:border-skyblue",
					errors?.length ? "border-coralpink/60" : "border-darknavy/10",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</td>
	);
}
