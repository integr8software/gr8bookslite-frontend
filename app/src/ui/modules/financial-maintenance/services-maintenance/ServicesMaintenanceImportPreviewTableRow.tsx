import {
  ServicesMaintenanceAccountSetupModeOptions,
  ServicesMaintenanceServiceTypeOptions,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { serviceImportRowHasErrors } from "@/app/src/data/modules/financial-maintenance/services-maintenance/ServicesMaintenanceData";
import type {
  ServicesMaintenanceImportColumnId,
  ServicesMaintenanceImportPreviewRow,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import {
  ModuleImportEditableCell,
  ModuleImportEditableSelect,
  ModuleImportRowNumberCell,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function ServicesMaintenanceImportPreviewTableRow({
  isSelected,
  onMoveRow,
  onPasteCell,
  onToggleSelected,
  onUpdateCell,
  row,
}: {
  isSelected: boolean;
  onMoveRow: (sourceRowId: string, targetRowId: string, position: "before" | "after") => void;
  onPasteCell: (rowId: string, field: ServicesMaintenanceImportColumnId, text: string) => void;
  onToggleSelected: (rowId: string, isSelected: boolean) => void;
  onUpdateCell: (rowId: string, field: ServicesMaintenanceImportColumnId, value: string) => void;
  row: ServicesMaintenanceImportPreviewRow;
}) {
  const hasErrors = serviceImportRowHasErrors(row);
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
            value={row.service.serviceName}
            errors={row.cellErrors.serviceName}
            onChange={(value) => onUpdateCell(row.id, "serviceName", value)}
            onPaste={(text) => onPasteCell(row.id, "serviceName", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableSelect
            value={row.service.serviceType}
            errors={row.cellErrors.serviceType}
            options={ServicesMaintenanceServiceTypeOptions}
            onChange={(value) => onUpdateCell(row.id, "serviceType", value)}
            onPaste={(text) => onPasteCell(row.id, "serviceType", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableCell
            value={row.service.description}
            errors={row.cellErrors.description}
            onChange={(value) => onUpdateCell(row.id, "description", value)}
            onPaste={(text) => onPasteCell(row.id, "description", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableSelect
            value={row.service.accountSetupMode}
            errors={row.cellErrors.accountSetupMode}
            options={ServicesMaintenanceAccountSetupModeOptions}
            onChange={(value) => onUpdateCell(row.id, "accountSetupMode", value)}
            onPaste={(text) => onPasteCell(row.id, "accountSetupMode", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableCell
            value={row.service.revenueCoaId}
            errors={row.cellErrors.revenueCoaId}
            onChange={(value) => onUpdateCell(row.id, "revenueCoaId", value)}
            onPaste={(text) => onPasteCell(row.id, "revenueCoaId", text)}
          />
        </td>
      </tr>
      {row.rowErrors.length > 0 ? (
        <tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
          <td />
          <td />
          <td colSpan={5} className="px-3 pb-3 text-xs font-semibold text-coralpink">
            {row.rowErrors.join(" ")}
          </td>
        </tr>
      ) : null}
    </>
  );
}
