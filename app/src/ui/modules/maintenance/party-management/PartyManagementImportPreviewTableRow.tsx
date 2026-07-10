"use client";

import {
  PartyClassificationOptions,
  VatRegistrationTypeOptions,
} from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
  partyImportRowHasErrors,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import type {
  PartyImportColumnId,
  PartyImportPreviewRow,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
  ModuleImportEditableCell,
  ModuleImportEditableSelect,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function PartyManagementImportPreviewTableRow({
  row,
  isSelected,
  onUpdateCell,
  onPasteCell,
  onToggleSelected,
}: {
  row: PartyImportPreviewRow;
  isSelected: boolean;
  onUpdateCell: (
    rowId: string,
    field: PartyImportColumnId,
    value: string,
  ) => void;
  onPasteCell: (
    rowId: string,
    field: PartyImportColumnId,
    text: string,
  ) => void;
  onToggleSelected: (rowId: string, isSelected: boolean) => void;
}) {
  const stickyCellBackground = isSelected
    ? "bg-skyblue/10"
    : partyImportRowHasErrors(row)
      ? "bg-coralpink/[0.025]"
      : "bg-white";

  return (
    <>
      <tr
        className={
          isSelected
            ? "bg-skyblue/10"
            : partyImportRowHasErrors(row)
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
        <td className="px-3 py-2 align-middle">
          <ImportCell
            row={row}
            field="partyCodeNo"
            onUpdateCell={onUpdateCell}
            onPasteCell={onPasteCell}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableSelect
            value={row.party.classification}
            errors={row.cellErrors.classification}
            warnings={row.cellWarnings.classification}
            options={PartyClassificationOptions}
            onChange={(value) => onUpdateCell(row.id, "classification", value)}
            onPaste={(text) => onPasteCell(row.id, "classification", text)}
          />
        </td>
        <td className="px-3 py-2 align-middle">
          <ImportCell row={row} field="partyTypes" onUpdateCell={onUpdateCell} onPasteCell={onPasteCell} />
        </td>
        {(
          [
            "partyName",
            "tradeName",
            "firstName",
            "middleName",
            "lastName",
            "suffixName",
            "tin",
          ] as const
        ).map((field) => (
          <td key={field} className="px-3 py-2 align-middle">
            <ImportCell
              row={row}
              field={field}
              onUpdateCell={onUpdateCell}
              onPasteCell={onPasteCell}
            />
          </td>
        ))}
        <td className="px-3 py-2 align-middle">
          <ModuleImportEditableSelect
            value={row.party.vatRegistrationType}
            errors={row.cellErrors.vatRegistrationType}
            warnings={row.cellWarnings.vatRegistrationType}
            options={["", ...VatRegistrationTypeOptions]}
            onChange={(value) =>
              onUpdateCell(row.id, "vatRegistrationType", value)
            }
            onPaste={(text) =>
              onPasteCell(row.id, "vatRegistrationType", text)
            }
          />
        </td>
        {(
          [
            "atcCode",
            "email",
            "contactNo",
            "addressLine1",
            "addressLine2",
            "barangay",
            "cityMunicipality",
            "province",
            "region",
          ] as const
        ).map((field) => (
          <td key={field} className="px-3 py-2 align-middle">
            <ImportCell
              row={row}
              field={field}
              onUpdateCell={onUpdateCell}
              onPasteCell={onPasteCell}
            />
          </td>
        ))}
      </tr>
      {row.rowErrors.length > 0 ? (
        <tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
          <td />
          <td
            colSpan={20}
            className="px-3 pb-3 text-xs font-semibold text-coralpink"
          >
            {row.rowErrors.join(" ")}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ImportCell({
  row,
  field,
  onUpdateCell,
  onPasteCell,
}: {
  row: PartyImportPreviewRow;
  field: PartyImportColumnId;
  onUpdateCell: (
    rowId: string,
    field: PartyImportColumnId,
    value: string,
  ) => void;
  onPasteCell: (
    rowId: string,
    field: PartyImportColumnId,
    text: string,
  ) => void;
}) {
  return (
    <ModuleImportEditableCell
      value={getPartyImportCellValue(row, field)}
      errors={row.cellErrors[field]}
      warnings={row.cellWarnings[field]}
      onChange={(value) => onUpdateCell(row.id, field, value)}
      onPaste={(text) => onPasteCell(row.id, field, text)}
    />
  );
}

function getPartyImportCellValue(
  row: PartyImportPreviewRow,
  field: PartyImportColumnId,
) {
  if (field === "partyTypes") {
    return row.party.partyTypes.join(", ");
  }

  if (
    field === "addressLine1" ||
    field === "addressLine2" ||
    field === "barangay" ||
    field === "cityMunicipality" ||
    field === "province" ||
    field === "region"
  ) {
    return row.party.address[field];
  }

  return String(row.party[field] ?? "");
}
