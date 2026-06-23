"use client";

import { AlertTriangle } from "lucide-react";
import { TermManagementDatemodeOptions } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermImportColumnId,
	TermImportPreviewRow,
} from "@/app/src/ui/modules/maintenance/term-management/TermManagementImportTypes";
import {
	isTabularPaste,
	rowHasErrors,
} from "@/app/src/ui/modules/maintenance/term-management/TermManagementImportUtils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function TermImportPreviewTableRow({
	row,
	isSelected,
	onUpdateCell,
	onPasteCell,
	onToggleSelected,
}: {
	row: TermImportPreviewRow;
	isSelected: boolean;
	onUpdateCell: (
		rowId: string,
		field: TermImportColumnId,
		value: string,
	) => void;
	onPasteCell: (rowId: string, field: TermImportColumnId, text: string) => void;
	onToggleSelected: (rowId: string, isSelected: boolean) => void;
}) {
	const stickyCellBackground = isSelected
		? "bg-skyblue/10"
		: rowHasErrors(row)
			? "bg-coralpink/[0.025]"
			: "bg-white";

	return (
		<>
			<tr
				className={
					isSelected
						? "bg-skyblue/10"
						: rowHasErrors(row)
							? "bg-coralpink/[0.025]"
							: undefined
				}
			>
				<td
					className={joinClasses(
						"sticky left-0 z-10 w-16 px-2 py-2 align-middle font-semibold",
						stickyCellBackground,
					)}
				>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							checked={isSelected}
							onClick={(event) => event.stopPropagation()}
							onChange={(event) =>
								onToggleSelected(row.id, event.target.checked)
							}
							aria-label={`Select row ${row.rowNumber}`}
							className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
						/>
						<button
							type="button"
							onClick={() => onToggleSelected(row.id, !isSelected)}
							className="rounded px-0.5 text-left hover:text-skyblue focus:outline-none focus:ring-2 focus:ring-skyblue/20"
							aria-label={`${isSelected ? "Deselect" : "Select"} row ${row.rowNumber}`}
						>
							{row.rowNumber}
						</button>
					</div>
				</td>
				<td
					className={joinClasses(
						"sticky left-16 z-10 min-w-56 px-3 py-2 align-middle",
						stickyCellBackground,
					)}
				>
					<EditableImportCell
						value={row.term.name}
						errors={row.cellErrors.name}
						warnings={row.cellWarnings.name}
						onChange={(value) => onUpdateCell(row.id, "name", value)}
						onPaste={(text) => onPasteCell(row.id, "name", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<EditableImportSelect
						value={row.term.datemode}
						errors={row.cellErrors.datemode}
						warnings={row.cellWarnings.datemode}
						options={TermManagementDatemodeOptions}
						onChange={(value) => onUpdateCell(row.id, "datemode", value)}
						onPaste={(text) => onPasteCell(row.id, "datemode", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<EditableImportCell
						type="number"
						value={row.term.period}
						errors={row.cellErrors.period}
						warnings={row.cellWarnings.period}
						onChange={(value) => onUpdateCell(row.id, "period", value)}
						onPaste={(text) => onPasteCell(row.id, "period", text)}
					/>
				</td>
			</tr>
			{row.rowErrors.length > 0 ? (
				<tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
					<td />
					<td
						colSpan={3}
						className="px-3 pb-3 text-xs font-semibold text-coralpink"
					>
						{row.rowErrors.join(" ")}
					</td>
				</tr>
			) : null}
		</>
	);
}

function EditableImportCell({
	errors,
	warnings,
	type = "text",
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	warnings?: string[];
	type?: "number" | "text";
	value: string;
	onChange: (value: string) => void;
	onPaste: (text: string) => void;
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	return (
		<label className="relative block">
			<input
				type={type}
				min={type === "number" ? 0 : undefined}
				value={value}
				onChange={(event) => {
					const nextValue = event.target.value;

					if (type === "number" && nextValue.trim() && Number(nextValue) < 0) {
						return;
					}

					onChange(nextValue);
				}}
				onKeyDown={(event) => {
					if (
						type === "number" &&
						["-", "+", ".", "e", "E"].includes(event.key)
					) {
						event.preventDefault();
					}
				}}
				onPaste={(event) => {
					const text = event.clipboardData.getData("text");

					if (
						type === "number" &&
						!isTabularPaste(text) &&
						!/^\d+$/.test(text.trim())
					) {
						event.preventDefault();
						return;
					}

					if (isTabularPaste(text)) {
						event.preventDefault();
						onPaste(text);
					}
				}}
				onWheel={(event) => {
					if (type === "number") {
						event.currentTarget.blur();
					}
				}}
				title={messages.join(" ")}
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					messages.length ? "pr-9" : "",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: warnings?.length
							? "border-amber-400/70 focus:border-amber-500 focus:ring-amber-500/15"
							: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			/>
			<CellIssueIcon errors={errors} warnings={warnings} />
		</label>
	);
}

function EditableImportSelect<TOption extends string>({
	errors,
	warnings,
	options,
	value,
	onChange,
	onPaste,
}: {
	errors?: string[];
	warnings?: string[];
	options: readonly TOption[];
	value: string;
	onChange: (value: string) => void;
	onPaste: (text: string) => void;
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	return (
		<label className="relative block">
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onPaste={(event) => {
					const text = event.clipboardData.getData("text");

					if (text.trim()) {
						event.preventDefault();
						onPaste(text);
					}
				}}
				title={messages.join(" ")}
				className={joinClasses(
					"h-10 w-full rounded-md border bg-white px-2 text-sm font-medium text-darknavy outline-none transition focus:ring-2",
					messages.length ? "pr-9" : "",
					errors?.length
						? "border-coralpink/45 focus:border-coralpink focus:ring-coralpink/15"
						: warnings?.length
							? "border-amber-400/70 focus:border-amber-500 focus:ring-amber-500/15"
							: "border-darknavy/12 focus:border-skyblue focus:ring-skyblue/15",
				)}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
			<CellIssueIcon errors={errors} warnings={warnings} />
		</label>
	);
}

function CellIssueIcon({
	errors,
	warnings,
}: {
	errors?: string[];
	warnings?: string[];
}) {
	const messages = [...(errors ?? []), ...(warnings ?? [])];

	if (messages.length === 0) {
		return null;
	}

	const hasErrors = Boolean(errors?.length);

	return (
		<span
			className={joinClasses(
				"absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border bg-white",
				hasErrors
					? "border-coralpink/45 text-coralpink"
					: "border-amber-400/70 text-amber-600",
			)}
			title={messages.join(" ")}
			aria-label={messages.join(" ")}
		>
			<AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
		</span>
	);
}
