import {
	PaymentTypeClassificationOptions,
} from "@/app/src/constants/modules/maintenance/payment-type/PaymentTypeConstants";
import type {
	PaymentTypeImportColumnId,
	PaymentTypeImportPreviewRow,
} from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import { paymentTypeImportRowHasErrors } from "@/app/src/data/modules/maintenance/payment-type/PaymentTypeData";
import {
	ModuleImportEditableCell,
	ModuleImportEditableSelect,
	ModuleImportRowNumberCell,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function PaymentTypeImportPreviewTableRow({
	isSelected,
	onPasteCell,
	onMoveRow,
	onToggleSelected,
	onUpdateCell,
	row,
}: {
	isSelected: boolean;
	onPasteCell: (
		rowId: string,
		field: PaymentTypeImportColumnId,
		text: string,
	) => void;
	onToggleSelected: (rowId: string, isSelected: boolean) => void;
	onMoveRow: (sourceRowId: string, targetRowId: string, position: "before" | "after") => void;
	onUpdateCell: (
		rowId: string,
		field: PaymentTypeImportColumnId,
		value: string,
	) => void;
	row: PaymentTypeImportPreviewRow;
}) {
	const hasErrors = paymentTypeImportRowHasErrors(row);
	const stickyCellBackground = isSelected
		? "bg-skyblue/10"
		: hasErrors
			? "bg-coralpink/[0.025]"
			: "bg-white";

	return (
		<>
			<tr
				className={
					isSelected
						? "bg-skyblue/10"
						: hasErrors
							? "bg-coralpink/[0.025]"
							: undefined
				}
			>
				<td className={joinClasses("sticky left-0 z-20 w-11 text-center", stickyCellBackground)}>
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
				<ModuleImportRowNumberCell rowId={row.id} rowNumber={row.rowNumber} onMoveRow={onMoveRow} />
				<td
					className={joinClasses(
						"sticky left-[5.75rem] z-10 px-3 py-2 align-middle",
						stickyCellBackground,
					)}
				>
					<ModuleImportEditableCell
						value={row.paymentType.paymentType}
						errors={row.cellErrors.paymentType}
						warnings={row.cellWarnings.paymentType}
						onChange={(value) => onUpdateCell(row.id, "paymentType", value)}
						onPaste={(text) => onPasteCell(row.id, "paymentType", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableCell
						value={row.paymentType.description}
						errors={row.cellErrors.description}
						warnings={row.cellWarnings.description}
						onChange={(value) => onUpdateCell(row.id, "description", value)}
						onPaste={(text) => onPasteCell(row.id, "description", text)}
					/>
				</td>
				<td className="px-3 py-2 align-middle">
					<ModuleImportEditableSelect
						value={row.paymentType.type}
						errors={row.cellErrors.type}
						warnings={row.cellWarnings.type}
						options={PaymentTypeClassificationOptions}
						onChange={(value) => onUpdateCell(row.id, "type", value)}
						onPaste={(text) => onPasteCell(row.id, "type", text)}
					/>
				</td>
			</tr>
			{row.rowErrors.length > 0 ? (
				<tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
					<td />
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


