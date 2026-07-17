"use client";

import { UnitOfMeasurementQuantityModeOptions } from "@/app/src/constants/modules/maintenance/unit-of-measurement/UnitOfMeasurementConstants";
import {
	unitOfMeasurementImportRowHasErrors,
} from "@/app/src/data/modules/maintenance/unit-of-measurement/UnitOfMeasurementData";
import type {
	UnitOfMeasurementImportColumnId,
	UnitOfMeasurementImportPreviewRow,
} from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import {
	ModuleImportEditableCell,
	ModuleImportEditableSelect,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function UnitOfMeasurementImportPreviewTableRow({
	row,
	isSelected,
	onUpdateCell,
	onPasteCell,
	onToggleSelected,
}: {
	row: UnitOfMeasurementImportPreviewRow;
	isSelected: boolean;
	onUpdateCell: (
		rowId: string,
		field: UnitOfMeasurementImportColumnId,
		value: string,
	) => void;
	onPasteCell: (
		rowId: string,
		field: UnitOfMeasurementImportColumnId,
		text: string,
	) => void;
	onToggleSelected: (rowId: string, isSelected: boolean) => void;
}) {
	const stickyCellBackground = isSelected
		? "bg-skyblue/10"
		: unitOfMeasurementImportRowHasErrors(row)
			? "bg-coralpink/[0.025]"
			: "bg-white";

	return (
		<>
			<tr
				className={
					isSelected
						? "bg-skyblue/10"
						: unitOfMeasurementImportRowHasErrors(row)
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
						"sticky left-16 z-10 px-3 py-2 align-middle",
						stickyCellBackground,
					)}
				>
					<ModuleImportEditableCell
						value={row.record.name}
						errors={row.cellErrors.name}
						warnings={row.cellWarnings.name}
						onChange={(value) => onUpdateCell(row.id, "name", value)}
						onPaste={(text) => onPasteCell(row.id, "name", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableCell
						value={row.record.symbol}
						errors={row.cellErrors.symbol}
						warnings={row.cellWarnings.symbol}
						onChange={(value) => onUpdateCell(row.id, "symbol", value)}
						onPaste={(text) => onPasteCell(row.id, "symbol", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableSelect
						value={row.record.quantityMode}
						errors={row.cellErrors.quantityMode}
						warnings={row.cellWarnings.quantityMode}
						options={UnitOfMeasurementQuantityModeOptions.map(
							(option) => option.value,
						)}
						onChange={(value) => onUpdateCell(row.id, "quantityMode", value)}
						onPaste={(text) => onPasteCell(row.id, "quantityMode", text)}
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
