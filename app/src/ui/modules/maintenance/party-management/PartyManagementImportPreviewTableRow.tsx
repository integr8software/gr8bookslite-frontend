"use client";

import {
  PartyImportFieldOrder,
  PartyImportPreviewColumnCount,
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
        {PartyImportFieldOrder.map((field) => (
          <td key={field} className="px-3 py-2 align-middle">
            {field === "classification" ? (
              <ModuleImportEditableSelect
                value={row.party.classification}
                errors={row.cellErrors.classification}
                warnings={row.cellWarnings.classification}
                options={PartyClassificationOptions}
                onChange={(value) =>
                  onUpdateCell(row.id, "classification", value)
                }
                onPaste={(text) => onPasteCell(row.id, "classification", text)}
              />
            ) : field === "vatRegistrationType" ? (
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
            ) : (
              <ImportCell
                row={row}
                field={field}
                onUpdateCell={onUpdateCell}
                onPasteCell={onPasteCell}
              />
            )}
          </td>
        ))}
      </tr>
      {row.rowErrors.length > 0 ? (
        <tr className={isSelected ? "bg-skyblue/10" : "bg-coralpink/[0.025]"}>
          <td />
          <td
            colSpan={PartyImportPreviewColumnCount - 1}
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
    isPartyImportAddressColumn(field)
  ) {
    return getPartyImportAddressValue(row, field);
  }

  return String(row.party[field] ?? "");
}

function getPartyImportAddressValue(
  row: PartyImportPreviewRow,
  field: PartyImportAddressColumnId,
) {
  const { property, role } = PartyImportAddressColumnMap[field];
  const address =
    role === "default"
      ? row.party.address
      : row.party.addresses.find((candidate) =>
          partyImportAddressHasRole(candidate, role),
        );

  return String(address?.[property] ?? "");
}

function partyImportAddressHasRole(
  address: PartyImportPreviewRow["party"]["address"],
  role: PartyImportAddressRole,
) {
  if (role === "billing") return address.isBilling;
  if (role === "delivery") return address.isDelivery;
  if (role === "home") return address.isHome;

  return address.isDefault;
}

function isPartyImportAddressColumn(
  field: PartyImportColumnId,
): field is PartyImportAddressColumnId {
  return field in PartyImportAddressColumnMap;
}

const PartyImportAddressColumnMap = {
  addressLine1: { property: "addressLine1", role: "default" },
  addressLine2: { property: "addressLine2", role: "default" },
  barangay: { property: "barangay", role: "default" },
  cityMunicipality: { property: "cityMunicipality", role: "default" },
  province: { property: "province", role: "default" },
  homeAddressLine1: { property: "addressLine1", role: "home" },
  homeAddressLine2: { property: "addressLine2", role: "home" },
  homeBarangay: { property: "barangay", role: "home" },
  homeCityMunicipality: { property: "cityMunicipality", role: "home" },
  homeProvince: { property: "province", role: "home" },
  billingAddressLine1: { property: "addressLine1", role: "billing" },
  billingAddressLine2: { property: "addressLine2", role: "billing" },
  billingBarangay: { property: "barangay", role: "billing" },
  billingCityMunicipality: { property: "cityMunicipality", role: "billing" },
  billingProvince: { property: "province", role: "billing" },
  deliveryAddressLine1: { property: "addressLine1", role: "delivery" },
  deliveryAddressLine2: { property: "addressLine2", role: "delivery" },
  deliveryBarangay: { property: "barangay", role: "delivery" },
  deliveryCityMunicipality: { property: "cityMunicipality", role: "delivery" },
  deliveryProvince: { property: "province", role: "delivery" },
} as const;

type PartyImportAddressColumnId = keyof typeof PartyImportAddressColumnMap;
type PartyImportAddressRole = "billing" | "default" | "delivery" | "home";
