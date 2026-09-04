import { DefaultAccountTypeOptions } from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import {
  defaultAccountImportRowHasErrors,
  getDefaultAccountTypeLabel,
} from "@/app/src/data/modules/financial-maintenance/default-account/DefaultAccountData";
import type {
  DefaultAccountImportColumnId,
  DefaultAccountImportPreviewRow,
} from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import {
  ModuleImportEditableCell,
  ModuleImportEditableSelect,
  ModuleImportRowNumberCell,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DefaultAccountImportPreviewTableRow({
  isSelected,
  onMoveRow,
  onPasteCell,
  onToggleSelected,
  onUpdateCell,
  row,
}: {
  isSelected: boolean;
  onMoveRow: (sourceRowId: string, targetRowId: string, position: "before" | "after") => void;
  onPasteCell: (rowId: string, field: DefaultAccountImportColumnId, text: string) => void;
  onToggleSelected: (rowId: string, isSelected: boolean) => void;
  onUpdateCell: (rowId: string, field: DefaultAccountImportColumnId, value: string) => void;
  row: DefaultAccountImportPreviewRow;
}) {
  const hasErrors = defaultAccountImportRowHasErrors(row);
  const stickyCellBackground = isSelected ? "bg-skyblue/10" : hasErrors ? "bg-coralpink/[0.025]" : "bg-white";
  const typeOptions = DefaultAccountTypeOptions.map((option) => option.value);

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
            value={row.defaultAccount.defaultAccountName}
            errors={row.cellErrors.defaultAccountName}
            onChange={(value) => onUpdateCell(row.id, "defaultAccountName", value)}
            onPaste={(text) => onPasteCell(row.id, "defaultAccountName", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableCell
            value={row.defaultAccount.description}
            errors={row.cellErrors.description}
            onChange={(value) => onUpdateCell(row.id, "description", value)}
            onPaste={(text) => onPasteCell(row.id, "description", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <label className="sr-only">{getDefaultAccountTypeLabel(row.defaultAccount.type)}</label>
          <ModuleImportEditableSelect
            value={row.defaultAccount.type}
            errors={row.cellErrors.type}
            options={typeOptions}
            getOptionLabel={getDefaultAccountTypeLabel}
            onChange={(value) => onUpdateCell(row.id, "type", value)}
            onPaste={(text) => onPasteCell(row.id, "type", text)}
          />
        </td>
      </tr>
      {row.rowErrors.length > 0 ? (
        <tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
          <td />
          <td />
          <td colSpan={3} className="px-3 pb-3 text-xs font-semibold text-coralpink">
            {row.rowErrors.join(" ")}
          </td>
        </tr>
      ) : null}
    </>
  );
}
