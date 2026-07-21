"use client";

import {
	DiscountManagementStatusOptions,
	DiscountManagementTypeOptions,
	DiscountManagementValueTypeOptions,
} from "@/app/src/constants/modules/maintenance/discount-management/DiscountManagementConstants";
import { rowHasErrors } from "@/app/src/data/modules/maintenance/discount-management/DiscountManagementData";
import type {
	DiscountImportColumnId,
	DiscountImportPreviewRow,
} from "@/app/src/types/modules/maintenance/discount-management/DiscountManagementTypes";
import {
	ModuleImportEditableCell,
	ModuleImportEditableSelect,
	ModuleImportRowNumberCell,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DiscountManagementImportPreviewTableRow({
	row,
	isSelected,
	onPasteCell,
	onMoveRow,
	onToggleSelected,
	onUpdateCell,
}: {
	row: DiscountImportPreviewRow;
	isSelected: boolean;
	onPasteCell: (
		rowId: string,
		field: DiscountImportColumnId,
		text: string,
	) => void;
	onToggleSelected: (rowId: string, isSelected: boolean) => void;
	onMoveRow: (
		sourceRowId: string,
		targetRowId: string,
		position: "before" | "after",
	) => void;
	onUpdateCell: (
		rowId: string,
		field: DiscountImportColumnId,
		value: string,
	) => void;
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
						"module-import-selection-column sticky left-0 z-20 text-center",
						stickyCellBackground,
					)}
				>
					<div className="flex items-center justify-center">
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
					</div>
				</td>
				<ModuleImportRowNumberCell
					rowId={row.id}
					rowNumber={row.rowNumber}
					onMoveRow={onMoveRow}
				/>
				<td
					className={joinClasses(
						"module-import-first-data-column sticky z-10 px-3 py-2 align-middle",
						stickyCellBackground,
					)}
				>
					<ModuleImportEditableCell
						value={row.discount.name}
						errors={row.cellErrors.name}
						warnings={row.cellWarnings.name}
						onChange={(value) =>
							onUpdateCell(row.id, "name", value)
						}
						onPaste={(text) => onPasteCell(row.id, "name", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableSelect
						value={row.discount.type}
						errors={row.cellErrors.type}
						warnings={row.cellWarnings.type}
						options={DiscountManagementTypeOptions}
						onChange={(value) =>
							onUpdateCell(row.id, "type", value)
						}
						onPaste={(text) => onPasteCell(row.id, "type", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableCell
						value={row.discount.description}
						errors={row.cellErrors.description}
						warnings={row.cellWarnings.description}
						onChange={(value) =>
							onUpdateCell(row.id, "description", value)
						}
						onPaste={(text) =>
							onPasteCell(row.id, "description", text)
						}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableSelect
						value={row.discount.discountType}
						errors={row.cellErrors.discountType}
						warnings={row.cellWarnings.discountType}
						options={DiscountManagementValueTypeOptions}
						onChange={(value) =>
							onUpdateCell(row.id, "discountType", value)
						}
						onPaste={(text) =>
							onPasteCell(row.id, "discountType", text)
						}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableCell
						type="number"
						value={String(row.discount.amount)}
						errors={row.cellErrors.amount}
						warnings={row.cellWarnings.amount}
						onChange={(value) =>
							onUpdateCell(row.id, "amount", value)
						}
						onPaste={(text) => onPasteCell(row.id, "amount", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableSelect
						value={row.discount.status}
						errors={row.cellErrors.status}
						warnings={row.cellWarnings.status}
						options={DiscountManagementStatusOptions}
						onChange={(value) =>
							onUpdateCell(row.id, "status", value)
						}
						onPaste={(text) => onPasteCell(row.id, "status", text)}
					/>
				</td>
			</tr>
			{row.rowErrors.length > 0 ? (
				<tr
					className={
						isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"
					}
				>
					<td />
					<td />
					<td
						colSpan={6}
						className="px-3 pb-3 text-xs font-semibold text-coralpink"
					>
						{row.rowErrors.join(" ")}
					</td>
				</tr>
			) : null}
		</>
	);
}
