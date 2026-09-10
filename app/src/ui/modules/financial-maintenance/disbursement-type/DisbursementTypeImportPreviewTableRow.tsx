import { DisbursementTypeImportRowHasErrors } from "@/app/src/data/modules/financial-maintenance/disbursement-type/DisbursementTypeMaintenanceData";
import type {
  DisbursementTypeImportColumnId,
  DisbursementTypeImportPreviewRow,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypeTypes";
import {
  ModuleImportEditableCell,
  ModuleImportRowNumberCell,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementTypeImportPreviewTableRow({
  isSelected,
  onMoveRow,
  onPasteCell,
  onToggleSelected,
  onUpdateCell,
  row,
}: {
  isSelected: boolean;
  onMoveRow: (sourceRowId: string, targetRowId: string, position: "before" | "after") => void;
  onPasteCell: (rowId: string, field: DisbursementTypeImportColumnId, text: string) => void;
  onToggleSelected: (rowId: string, isSelected: boolean) => void;
  onUpdateCell: (rowId: string, field: DisbursementTypeImportColumnId, value: string) => void;
  row: DisbursementTypeImportPreviewRow;
}) {
  const hasErrors = DisbursementTypeImportRowHasErrors(row);
  const stickyCellBackground = isSelected ? "bg-skyblue/10" : hasErrors ? "bg-coralpink/[0.025]" : "bg-white";

  return (
    <>
      <tr className={isSelected ? "bg-skyblue/10" : hasErrors ? "bg-coralpink/[0.025]" : undefined}>
        <td className={joinClasses("module-import-selection-column sticky left-0 z-20 text-center", stickyCellBackground)}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(event) => onToggleSelected(row.id, event.target.checked)}
            aria-label={`Select row ${row.rowNumber}`}
            className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
          />
        </td>
        <ModuleImportRowNumberCell rowId={row.id} rowNumber={row.rowNumber} onMoveRow={onMoveRow} />
        <td className={joinClasses("module-import-first-data-column sticky z-10 px-3 py-2 align-middle", stickyCellBackground)}>
          <ModuleImportEditableCell
            value={row.disbursementType.disbursementTypeName}
            errors={row.cellErrors.disbursementTypeName}
            onChange={(value) => onUpdateCell(row.id, "disbursementTypeName", value)}
            onPaste={(text) => onPasteCell(row.id, "disbursementTypeName", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableCell
            value={row.disbursementType.description}
            errors={row.cellErrors.description}
            onChange={(value) => onUpdateCell(row.id, "description", value)}
            onPaste={(text) => onPasteCell(row.id, "description", text)}
          />
        </td>
      </tr>
      {row.rowErrors.length > 0 ? (
        <tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
          <td />
          <td />
          <td colSpan={2} className="px-3 pb-3 text-xs font-semibold text-coralpink">
            {row.rowErrors.join(" ")}
          </td>
        </tr>
      ) : null}
    </>
  );
}
