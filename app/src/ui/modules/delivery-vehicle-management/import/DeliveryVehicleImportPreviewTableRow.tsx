"use client";

import type { DeliveryVehicleField } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import {
  ModuleImportEditableCell,
  ModuleImportEditableSelect,
  ModuleImportRowNumberCell,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import {
  deliveryVehicleImportRowHasErrors,
  type DeliveryVehicleImportPreviewRow,
} from "@/app/src/ui/modules/delivery-vehicle-management/import/DeliveryVehicleModuleImportUtils";

type Props = {
  fields: readonly DeliveryVehicleField[];
  isSelected: boolean;
  row: DeliveryVehicleImportPreviewRow;
  onPasteCell: (rowId: string, fieldKey: string, text: string) => void;
  onToggleSelected: (rowId: string, isSelected: boolean) => void;
  onUpdateCell: (rowId: string, fieldKey: string, value: string) => void;
};

export function DeliveryVehicleImportPreviewTableRow({
  fields,
  isSelected,
  row,
  onPasteCell,
  onToggleSelected,
  onUpdateCell,
}: Props) {
  const stickyCellBackground = isSelected
    ? "bg-skyblue/10"
    : deliveryVehicleImportRowHasErrors(row)
      ? "bg-coralpink/[0.025]"
      : "bg-white";

  return (
    <>
      <tr
        className={
          isSelected
            ? "bg-skyblue/10"
            : deliveryVehicleImportRowHasErrors(row)
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
              onChange={(event) => onToggleSelected(row.id, event.target.checked)}
              aria-label={`Select row ${row.rowNumber}`}
              className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
            />
          </div>
        </td>
        <ModuleImportRowNumberCell rowId={row.id} rowNumber={row.rowNumber} />
        {fields.map((field, index) => (
          <td
            key={field.key}
            className={joinClasses(
              "px-3 py-2 align-middle",
              index === 0 ? "module-import-first-data-column" : "",
            )}
          >
            {field.type === "select" && field.options ? (
              <ModuleImportEditableSelect
                value={row.values[field.key] ?? ""}
                errors={row.cellErrors[field.key]}
                warnings={row.cellWarnings[field.key]}
                options={field.options}
                onChange={(value) => onUpdateCell(row.id, field.key, value)}
                onPaste={(text) => onPasteCell(row.id, field.key, text)}
              />
            ) : (
              <ModuleImportEditableCell
                type={field.type === "number" ? "number" : "text"}
                value={row.values[field.key] ?? ""}
                errors={row.cellErrors[field.key]}
                warnings={row.cellWarnings[field.key]}
                onChange={(value) => onUpdateCell(row.id, field.key, value)}
                onPaste={(text) => onPasteCell(row.id, field.key, text)}
              />
            )}
          </td>
        ))}
      </tr>
      {row.rowErrors.length > 0 ? (
        <tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
          <td />
          <td />
          <td colSpan={fields.length} className="px-3 pb-3 text-xs font-semibold text-coralpink">
            {row.rowErrors.join(" ")}
          </td>
        </tr>
      ) : null}
    </>
  );
}
