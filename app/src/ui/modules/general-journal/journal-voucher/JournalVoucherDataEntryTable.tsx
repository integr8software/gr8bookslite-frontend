"use client";

import { useMemo, useState } from "react";
import {
  JournalVoucherLineColumnIds,
  JournalVoucherLineDefaultVisibleColumnIds,
  JournalVoucherLineColumnLabels,
  JournalVoucherLineColumnWidths,
  JournalVoucherProtectedLineColumnIds,
  JournalVoucherVatTypeOptions,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import { formatJournalVoucherAmount } from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useJournalVoucherLookups } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucher";
import type { useJournalVoucherFormPage } from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucherFormPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import type {
  JournalVoucherLine,
  JournalVoucherLineColumnId,
  JournalVoucherLineField,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import { AppAdvancedDropdown, type AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ChartAccountDropdown } from "@/app/src/ui/shared/advanced-dropdown/ChartAccountDropdown";
import {
  ModuleDataEntry,
  type ModuleDataEntryColumn,
  type ModuleDataEntryColumnOption,
} from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { clampColumnWidth } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { MoneyNumberField, formatMoneyNumberInput, parseMoneyNumberInput } from "@/app/src/ui/shared/money/MoneyNumberField";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type JournalVoucherDataEntryTableProps = {
  canAddPartyName: boolean;
  onAddPartyName: (lineId: string) => void;
  page: ReturnType<typeof useJournalVoucherFormPage>;
};

export function JournalVoucherDataEntryTable({
  canAddPartyName,
  onAddPartyName,
  page,
}: JournalVoucherDataEntryTableProps) {
  const [columnOrder, setColumnOrder] = useState<JournalVoucherLineColumnId[]>([...JournalVoucherLineColumnIds]);
  const [visibleColumnIds, setVisibleColumnIds] = useState<JournalVoucherLineColumnId[]>([...JournalVoucherLineDefaultVisibleColumnIds]);
  const [columnLabels, setColumnLabels] = useState<Record<JournalVoucherLineColumnId, string>>({ ...JournalVoucherLineColumnLabels });
  const [columnWidths, setColumnWidths] = useState<Record<JournalVoucherLineColumnId, number>>({ ...JournalVoucherLineColumnWidths });
  const partyRecords = usePartyManagementStore((state) => state.records);
  const responsibilityCenters = useResponsibilityCenterStore((state) => state.centers);
  const journalVoucherLookups = useJournalVoucherLookups();
  const chartAccounts = useMemo(
    () =>
      (journalVoucherLookups.data?.accounts ?? []).map((account) => ({
        accountCategory: account.accountNature,
        accountName: account.accountTitle,
        accountNumber: account.accountCode,
        accountType: account.accountType,
        description: account.accountTitle,
        id: account.id,
        normalBalance: "Debit" as const,
        statementGroup: "",
        statementSection: account.accountNature,
        status: account.status === "ACTIVE" ? ("Active" as const) : ("Inactive" as const),
      })),
    [journalVoucherLookups.data?.accounts],
  );
  const partyOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createPartyOptions(partyRecords, page.values.lines),
    [page.values.lines, partyRecords],
  );
  const responsibilityCenterOptions = useMemo<AppAdvancedDropdownOption[]>(
    () => createResponsibilityCenterOptions(responsibilityCenters, page.values.lines),
    [page.values.lines, responsibilityCenters],
  );
  const visibleColumnOrder = columnOrder.filter((columnId) => visibleColumnIds.includes(columnId));
  const columns: ModuleDataEntryColumn<JournalVoucherLine>[] = visibleColumnOrder.map((columnId) => ({
    header: columnLabels[columnId],
    id: columnId,
    isRemovable: !JournalVoucherProtectedLineColumnIds.has(columnId),
    renderCell: (line) =>
      renderLineCell(
        page,
        line,
        columnId,
        chartAccounts,
        partyOptions,
        responsibilityCenterOptions,
        canAddPartyName,
        onAddPartyName,
      ),
    width: columnWidths[columnId],
    widthClassName: "",
    widthMode: "fixed",
  }));
  const columnOptions: ModuleDataEntryColumnOption[] = columnOrder.map((columnId) => ({
    id: columnId,
    isHideable: !JournalVoucherProtectedLineColumnIds.has(columnId),
    isVisible: visibleColumnIds.includes(columnId),
    label: columnLabels[columnId],
    width: columnWidths[columnId],
    widthMode: "fixed",
  }));

  function updateColumnHeader(columnId: string, header: string) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    setColumnLabels((currentLabels) => ({
      ...currentLabels,
      [columnId]: header,
    }));
  }

  function updateColumnWidth(columnId: string, width: number) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    setColumnWidths((currentWidths) => ({
      ...currentWidths,
      [columnId]: clampColumnWidth(width),
    }));
  }

  function fitColumnWidth(columnId: string) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    updateColumnWidth(
      columnId,
      calculateLineColumnFitWidth({
        columnId,
        columnLabels,
        lines: page.values.lines,
      }),
    );
  }

  function moveColumn(fromColumnId: string, toColumnId: string) {
    if (!isJournalVoucherLineColumnId(fromColumnId) || !isJournalVoucherLineColumnId(toColumnId)) {
      return;
    }

    setColumnOrder((currentOrder) => {
      const fromIndex = currentOrder.indexOf(fromColumnId);
      const toIndex = currentOrder.indexOf(toColumnId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      const [movedColumn] = nextOrder.splice(fromIndex, 1);

      nextOrder.splice(toIndex, 0, movedColumn);
      return nextOrder;
    });
  }

  function resetColumns() {
    setColumnOrder([...JournalVoucherLineColumnIds]);
    setVisibleColumnIds([...JournalVoucherLineDefaultVisibleColumnIds]);
    setColumnLabels({ ...JournalVoucherLineColumnLabels });
    setColumnWidths({ ...JournalVoucherLineColumnWidths });
  }

  function toggleColumnVisibility(columnId: string, isVisible: boolean) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    if (!isVisible && JournalVoucherProtectedLineColumnIds.has(columnId)) {
      return;
    }

    setVisibleColumnIds((currentVisibleIds) => {
      if (isVisible) {
        const nextVisibleIds = new Set([...currentVisibleIds, columnId]);

        return columnOrder.filter((currentColumnId) => nextVisibleIds.has(currentColumnId));
      }

      if (currentVisibleIds.length <= 1) {
        return currentVisibleIds;
      }

      return currentVisibleIds.filter((currentColumnId) => currentColumnId !== columnId);
    });
  }

  function clearCell(rowId: string, columnId: string) {
    if (!isJournalVoucherLineColumnId(columnId)) {
      return;
    }

    page.updateLine(rowId, columnId, columnId === "debit" || columnId === "credit" ? 0 : "");
  }

  function createExportRows() {
    return [
      visibleColumnOrder.map((columnId) => columnLabels[columnId]),
      ...page.values.lines.map((line) => visibleColumnOrder.map((columnId) => getLineExportCell(line, columnId))),
    ];
  }

  function handleExportCsv() {
    const csv = createExportRows()
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), "journal-voucher-entries.csv");
  }

  function handleExportExcel() {
    const htmlRows = createExportRows()
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`)
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table>${htmlRows}</table></body></html>`;

    downloadBlob(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }), "journal-voucher-entries.xls");
  }

  return (
    <ModuleDataEntry
      columns={columns}
      columnResetLabel="Default"
      columnOptions={columnOptions}
      description="Use the editable entry grid for manual accounting distributions."
      emptyRowLabel="entry"
      error={page.errors.lines ?? page.errors.balance}
      exportOptions={[
        {
          id: "csv",
          label: "CSV",
          onSelect: handleExportCsv,
        },
        {
          id: "excel",
          label: "Excel",
          onSelect: handleExportExcel,
        },
      ]}
      footerDetails={
        <span className={joinClasses("text-sm font-semibold", page.totals.isBalanced ? "text-emerald-700" : "text-coralpink")}>
          Variance: {formatJournalVoucherAmount(Math.abs(page.totals.variance))}
        </span>
      }
      getCellValue={(line, columnId) => (isJournalVoucherLineColumnId(columnId) ? getLineExportCell(line, columnId) : "")}
      isDraggable
      isReadonly={page.isReadonly}
      isRowNumberColumnFixed
      canConfigureColumnsWhenReadonly
      rows={page.values.lines}
      summaryCells={{
        credit: formatJournalVoucherAmount(page.totals.totalCredit),
        debit: formatJournalVoucherAmount(page.totals.totalDebit),
      }}
      summaryRowHeader="Totals"
      title="Accounting Entries"
      onAddRows={page.addLines}
      onAutoColumnWidth={fitColumnWidth}
      onClearCell={clearCell}
      onClearRows={page.clearLines}
      onDuplicateRow={page.duplicateLine}
      onFitColumnWidth={fitColumnWidth}
      onInsertRow={page.insertLine}
      onMoveColumn={moveColumn}
      onMoveRow={page.moveLine}
      onRemoveRow={page.removeLine}
      onResetColumns={resetColumns}
      onToggleColumnVisibility={toggleColumnVisibility}
      onUpdateColumnHeader={updateColumnHeader}
      onUpdateColumnWidth={updateColumnWidth}
    />
  );
}

function renderLineCell(
  page: ReturnType<typeof useJournalVoucherFormPage>,
  line: JournalVoucherLine,
  columnId: JournalVoucherLineColumnId,
  chartAccounts: ModuleChartAccount[],
  partyOptions: AppAdvancedDropdownOption[],
  responsibilityCenterOptions: AppAdvancedDropdownOption[],
  canAddPartyName: boolean,
  onAddPartyName: (lineId: string) => void,
) {
  const lineErrors = page.errors.lineErrors?.[line.id] ?? {};
  const isReadonly = page.isReadonly;

  switch (columnId) {
    case "accountCode":
      return <LineInput error={lineErrors.accountCode} value={line.accountCode} onChange={() => undefined} readOnly />;
    case "accountTitle":
      return (
        <ChartAccountDropdown
          accounts={chartAccounts}
          value={line.accountTitle}
          valueField="accountName"
          readOnly={isReadonly}
          isClearable
          className={accountingDropdownClassName(lineErrors.accountTitle)}
          ariaInvalid={Boolean(lineErrors.accountTitle)}
          placeholder="Select account title"
          searchPlaceholder="Search account title"
          onChange={() => undefined}
          onSelectAccount={(account) => {
            page.updateLine(line.id, "accountCode", account?.accountNumber ?? "");
            page.updateLine(line.id, "accountTitle", account?.accountName ?? "");
          }}
        />
      );
    case "partyCode":
      return <LineInput value={line.partyCode} onChange={() => undefined} readOnly />;
    case "partyName":
      return (
        <AppAdvancedDropdown
          addAction={
            !isReadonly && canAddPartyName
              ? {
                  label: "Add Party Name",
                  onClick: () => onAddPartyName(line.id),
                }
              : undefined
          }
          value={line.partyCode || getJournalVoucherPartyFallbackValue(line.partyName ?? "")}
          readOnly={isReadonly}
          options={partyOptions}
          placeholder="Select Party Name"
          searchPlaceholder="Search Party Name"
          className={accountingDropdownClassName()}
          showSelectedDetails
          onChange={(value) => {
            const selectedValue = String(value);
            const party = partyOptions.find((option) => option.value === selectedValue);
            const isFallbackValue = selectedValue.startsWith(JournalVoucherPartyFallbackValuePrefix);

            page.updateLine(line.id, "partyCode", isFallbackValue ? "" : selectedValue);
            page.updateLine(line.id, "partyName", party?.name ?? "");
          }}
        />
      );
    case "responsibilityCenter":
      return (
        <AppAdvancedDropdown
          value={line.responsibilityCenter}
          readOnly={isReadonly}
          options={responsibilityCenterOptions}
          placeholder="Select responsibility center"
          searchPlaceholder="Search responsibility center"
          className={accountingDropdownClassName()}
          onChange={(value) => page.updateLine(line.id, "responsibilityCenter", String(value))}
        />
      );
    case "debit":
    case "credit":
      return (
        <LineAmountInput
          disabled={isReadonly}
          error={lineErrors[columnId]}
          value={line[columnId]}
          onChange={(value) => page.updateLine(line.id, columnId, value)}
        />
      );
    case "vatType":
      return (
        <LineSelect
          disabled={isReadonly}
          value={line.vatType}
          options={JournalVoucherVatTypeOptions}
          onChange={(value) => page.updateLine(line.id, "vatType", value)}
        />
      );
    default:
      return (
        <LineInput
          disabled={isReadonly}
          error={lineErrors[columnId as keyof typeof lineErrors]}
          value={String(line[columnId] ?? "")}
          onChange={(value) => page.updateLine(line.id, columnId as JournalVoucherLineField, value)}
        />
      );
  }
}

function LineInput({
  disabled = false,
  error,
  onChange,
  readOnly = false,
  value,
}: {
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  value: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      title={error}
      className={accountingCellControlClassName(error ? "ring-2 ring-inset ring-red-500/45" : "")}
    />
  );
}

function LineSelect({
  disabled,
  onChange,
  options,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  options: readonly string[];
  value: string;
}) {
  return (
    <select
      className={accountingCellControlClassName()}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function LineAmountInput({
  disabled,
  error,
  onChange,
  value,
}: {
  disabled: boolean;
  error?: string;
  onChange: (value: number) => void;
  value: number;
}) {
  const [draftValue, setDraftValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const displayValue = isEditing ? draftValue : value > 0 ? formatMoneyNumberInput(value.toFixed(2)) : "";

  function handleValueChange(nextValue: string) {
    setDraftValue(nextValue);
    onChange(parseMoneyNumberInput(nextValue));
  }

  return (
    <MoneyNumberField
      value={displayValue}
      onValueChange={handleValueChange}
      onFocus={() => {
        setDraftValue(displayValue);
        setIsEditing(true);
      }}
      onBlur={() => {
        setDraftValue("");
        setIsEditing(false);
      }}
      disabled={disabled}
      title={error}
      className={accountingCellControlClassName(joinClasses("text-right tabular-nums", error ? "ring-2 ring-inset ring-red-500/45" : ""))}
    />
  );
}

const AccountingDropdownBaseClassName =
  "[&_.app-advanced-dropdown-control]:h-10 [&_.app-advanced-dropdown-control]:rounded-none [&_.app-advanced-dropdown-control]:border-0 [&_.app-advanced-dropdown-control]:bg-transparent [&_.app-advanced-dropdown-control]:px-3 [&_.app-advanced-dropdown-control]:shadow-none [&_.app-advanced-dropdown-control]:focus:ring-2 [&_.app-advanced-dropdown-control]:focus:ring-inset [&_.app-advanced-dropdown-control]:focus:ring-skyblue/35";

function accountingDropdownClassName(error?: string) {
  return joinClasses(
    AccountingDropdownBaseClassName,
    error &&
      "[&_.app-advanced-dropdown-control]:ring-2 [&_.app-advanced-dropdown-control]:ring-inset [&_.app-advanced-dropdown-control]:ring-red-500/45",
  );
}

const JournalVoucherPartyFallbackValuePrefix = "journal-voucher-party:";

function getJournalVoucherPartyFallbackValue(partyName: string) {
  const normalizedPartyName = partyName.trim().toLowerCase();

  return normalizedPartyName ? `${JournalVoucherPartyFallbackValuePrefix}${normalizedPartyName}` : "";
}

function createPartyOptions(partyRecords: PartyInformationRecord[], lines: JournalVoucherLine[]): AppAdvancedDropdownOption[] {
  const options = partyRecords.map((party) => ({
    description: party.partyTypes.join(", "),
    label: party.partyCodeNo,
    name: getPartyDisplayName(party),
    value: party.partyCodeNo,
  }));
  const optionNames = new Set(options.map((option) => option.name.toLowerCase()));
  const optionValues = new Set(options.map((option) => option.value));
  const customOptions: AppAdvancedDropdownOption[] = [];

  lines.forEach((line) => {
    const partyName = line.partyName.trim();
    const value = getJournalVoucherPartyFallbackValue(partyName);

    if (!partyName || optionNames.has(partyName.toLowerCase()) || optionValues.has(value)) {
      return;
    }

    optionValues.add(value);
    customOptions.push({
      description: "Copied entry party",
      label: line.partyCode,
      name: partyName,
      value,
    });
  });

  return [...options, ...customOptions];
}

function createResponsibilityCenterOptions(
  responsibilityCenters: ResponsibilityCenter[],
  lines: JournalVoucherLine[],
): AppAdvancedDropdownOption[] {
  const options = responsibilityCenters
    .filter((center) => center.status === "Active")
    .map((center) => ({
      description: `${center.category} / ${center.financialType}`,
      label: center.code,
      name: center.name,
      value: center.name,
    }));
  const optionValues = new Set(options.map((option) => option.value));
  const customOptions: AppAdvancedDropdownOption[] = [];

  lines.forEach((line) => {
    const responsibilityCenter = line.responsibilityCenter.trim();

    if (!responsibilityCenter || optionValues.has(responsibilityCenter)) {
      return;
    }

    optionValues.add(responsibilityCenter);
    customOptions.push({
      description: "Copied responsibility center",
      label: responsibilityCenter,
      name: responsibilityCenter,
      value: responsibilityCenter,
    });
  });

  return [...options, ...customOptions];
}

function accountingCellControlClassName(extraClassName?: string) {
  return joinClasses(
    "h-10 w-full rounded-none border-0 bg-transparent px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:bg-skyblue/10 focus:ring-2 focus:ring-inset focus:ring-skyblue/35 disabled:cursor-not-allowed disabled:bg-offwhite/45 disabled:text-darknavy/35",
    extraClassName,
  );
}

function isJournalVoucherLineColumnId(columnId: string): columnId is JournalVoucherLineColumnId {
  return JournalVoucherLineColumnIds.includes(columnId as JournalVoucherLineColumnId);
}

function getLineExportCell(line: JournalVoucherLine, columnId: JournalVoucherLineColumnId) {
  switch (columnId) {
    case "debit":
    case "credit":
      return line[columnId] > 0 ? line[columnId].toFixed(2) : "";
    default:
      return String(line[columnId] ?? "");
  }
}

function calculateLineColumnFitWidth({
  columnId,
  columnLabels,
  lines,
}: {
  columnId: JournalVoucherLineColumnId;
  columnLabels: Record<JournalVoucherLineColumnId, string>;
  lines: JournalVoucherLine[];
}) {
  const headerWidth = estimateTextWidth(columnLabels[columnId], 76);
  const contentWidth = lines.reduce(
    (currentWidth, line) => Math.max(currentWidth, estimateTextWidth(String(getLineExportCell(line, columnId)), 24)),
    50,
  );

  return Math.max(headerWidth, contentWidth);
}

function estimateTextWidth(value: string, padding: number) {
  return clampColumnWidth(value.trim().length * 7.5 + padding);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
