import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { BeginningBalanceUploaderColumns, BeginningBalanceUploaderPageCopy } from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import { formatBeginningBalanceAmount } from "@/app/src/data/modules/beginning-balance-uploader/BeginningBalanceUploaderData";
import { ModuleChartAccounts } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import {
  getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { fetchPartyManagementRecords } from "@/app/src/services/modules/maintenance/party-management/PartyManagementApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/maintenance/party-management/PartyManagementQueryKeys";
import type { BeginningBalanceUploaderField, BeginningBalanceUploaderRow, BeginningBalanceUploaderTotals } from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";
import type { ModuleDataEntryCellTarget } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type Props = {
  rows: BeginningBalanceUploaderRow[];
  totals: BeginningBalanceUploaderTotals;
  error?: string;
  isReadonly: boolean;
  onAddRows: (count?: number) => void;
  onDeleteRow: (rowId: string) => void;
  onPasteRows: (target: ModuleDataEntryCellTarget, rows: string[][]) => void;
  onDuplicateRow: (rowId: string) => void;
  onInsertRow: (rowId: string, position: "above" | "below") => void;
  onMoveRow: (fromRowId: string, toRowId: string) => void;
  onUpdateRow: (rowId: string, field: BeginningBalanceUploaderField, value: string) => void;
  onUpdateRowFields: (rowId: string, values: Partial<BeginningBalanceUploaderRow>) => void;
};

export function BeginningBalanceUploaderEntriesTable({ rows, totals, error, isReadonly, onAddRows, onDeleteRow, onDuplicateRow, onInsertRow, onMoveRow, onPasteRows, onUpdateRow, onUpdateRowFields }: Props) {
  const partiesQuery = useQuery({
    queryKey: PartyManagementQueryKeys.records(),
    queryFn: fetchPartyManagementRecords,
  });
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () =>
      (partiesQuery.data?.records ?? []).filter((party) => party.status === "Active").map(
        (party) => ({
          description: party.partyTypes.join(", "),
          label: party.partyCodeNo,
          name: getPartyDisplayName(party),
          value: party.partyCodeNo,
        }),
      ),
    [partiesQuery.data?.records],
  );

  const columns = useMemo<ModuleDataEntryColumn<BeginningBalanceUploaderRow>[]>(
    () => BeginningBalanceUploaderColumns.map((column) => ({
      id: column.field,
      header: column.label,
      widthClassName:
        column.field === "accntTitle" || column.field === "partyName" || column.field === "particulars"
          ? "w-[18rem]"
          : "w-[12rem]",
      renderCell: (row) => {
        if (column.field === "accntTitle") {
          return (
            <ChartAccountDropdown
              accounts={ModuleChartAccounts}
              className={DataEntryDropdownClassName}
              isClearable
              menuPortal
              placeholder="Select account title"
              searchPlaceholder="Search account title or code"
              value={row.accntTitle}
              valueField="accountName"
              readOnly={isReadonly}
              onChange={() => undefined}
              onSelectAccount={(account) =>
                onUpdateRowFields(row.id, {
                  accntCode: account?.accountNumber ?? "",
                  accntTitle: account?.accountName ?? "",
                })
              }
            />
          );
        }

        if (column.field === "partyName") {
          return (
            <AppAdvancedDropdown
              className={DataEntryDropdownClassName}
              isClearable
              menuPortal
              options={partyOptions}
              placeholder="Select party name"
              searchPlaceholder="Search party name or code"
              showSelectedDetails
              readOnly={isReadonly}
              value={row.partyCode}
              onChange={(value) => {
                const partyCode = String(value);
                const party = partyOptions.find((option) => option.value === partyCode);
                onUpdateRowFields(row.id, {
                  partyCode,
                  partyName: party?.name ?? "",
                });
              }}
            />
          );
        }

        const isAutoFilled = column.field === "accntCode" || column.field === "partyCode";

        return (
          <input
            type={column.type ?? "text"}
            inputMode={column.inputMode}
            readOnly={isReadonly || isAutoFilled}
            value={row[column.field]}
            placeholder={column.placeholder}
            onChange={(event) => onUpdateRow(row.id, column.field, event.target.value)}
            className={joinClasses(
              "h-10 w-full border-0 bg-transparent px-3 text-sm text-darknavy outline-none focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35",
              isAutoFilled && "bg-offwhite text-darknavy/60",
              column.align === "right" && "text-right tabular-nums",
            )}
          />
        );
      },
    })),
    [isReadonly, onUpdateRow, onUpdateRowFields, partyOptions],
  );

  return <ModuleDataEntry
    columns={columns}
    description={BeginningBalanceUploaderPageCopy.entriesDescription}
    emptyRowLabel="entry"
    error={error}
    isDraggable
    isReadonly={isReadonly}
    rows={rows}
    title={BeginningBalanceUploaderPageCopy.entriesTitle}
    summaryCells={{ debit: formatBeginningBalanceAmount(totals.debit), credit: formatBeginningBalanceAmount(totals.credit) }}
    footerDetails={<span className={joinClasses("font-semibold", Math.abs(totals.variance) < 0.001 ? "text-emerald-700" : "text-coralpink")}>Variance: {formatBeginningBalanceAmount(totals.variance)}</span>}
    onAddRows={onAddRows}
    onDuplicateRow={onDuplicateRow}
    onInsertRow={onInsertRow}
    onMoveRow={onMoveRow}
    onPasteCells={onPasteRows}
    onRemoveRow={onDeleteRow}
  />;
}

const DataEntryDropdownClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";
