import { formatCashAdvanceMultipleEntryAmount } from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
  CashAdvanceMultipleEntryAccountingColumnsParams,
  CashAdvanceMultipleEntryAccountingEntry,
  CashAdvanceMultipleEntryItemColumnsParams,
  CashAdvanceMultipleEntryItem,
} from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import type { CashAdvanceEmployeeOption } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";
import { ModuleDataEntryRemarksCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryRemarksCell";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

export function createCashAdvanceMultipleEntryItemColumns({
  employeeOptions,
  isReadonly,
  onOpenItemPartyDrawer,
  onOpenItemResponsibilityCenterDrawer,
  onUpdateEntry,
  responsibilityCenterOptions,
  rows,
}: CashAdvanceMultipleEntryItemColumnsParams): Record<string, ModuleDataEntryColumn<CashAdvanceMultipleEntryItem>> {
  const partySelectOptions = createPartyOptions("name", employeeOptions);

  return {
    partyCode: {
      header: "Employee Code",
      id: "partyCode",
      width: 125,
      widthClassName: "w-[7.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryInputCell id={context.fieldId} name={context.fieldName} readOnly value={row.partyCode} />
      ),
    },
    partyName: {
      header: "Employee Name",
      id: "partyName",
      width: 220,
      widthClassName: "w-[13.75rem]",
      renderCell: (row, _index, context) => {
        const availableOptions = getAvailableEmployeeOptions(partySelectOptions, rows, row.id);
        const options =
          row.partyCode && !availableOptions.some((opt) => opt.value === row.partyCode)
            ? [{ label: row.partyCode, name: row.partyName || row.partyCode, value: row.partyCode }, ...availableOptions]
            : availableOptions;

        return (
          <ModuleDataEntryDropdownCell
            id={context.fieldId}
            name={context.fieldName}
            readOnly={isReadonly}
            options={options}
            placeholder="Select Employee Name"
            searchPlaceholder="Search Employee Name"
            value={row.partyCode}
            addAction={!isReadonly ? { label: "Add Employee Name", onClick: () => onOpenItemPartyDrawer(row.id) } : undefined}
            onChange={(nextValue) => {
              const partyCode = String(nextValue);
              const employee = employeeOptions?.find((opt) => opt.partyCode === partyCode);
              const partyName = employee?.partyName ?? "";
              const cashAdvanceBalance = employee?.cashAdvanceBalance ?? "";
              const cashAdvanceLimit = employee?.cashAdvanceLimit ?? "";
              onUpdateEntry(row.id, { cashAdvanceBalance, cashAdvanceLimit, partyCode, partyName });
            }}
          />
        );
      },
    },
    amount: {
      header: "Cash Advance Amount",
      id: "amount",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => {
        const employee = employeeOptions?.find((opt) => opt.partyCode === row.partyCode);
        const effectiveBalance = row.cashAdvanceBalance?.trim() || employee?.cashAdvanceBalance?.trim() || "";
        const rowAmount = parseMoneyNumberInput(row.amount);
        const hasBalance = Boolean(effectiveBalance);
        const balance = parseMoneyNumberInput(effectiveBalance);
        const partyKey = row.partyCode.trim() || row.partyName.trim();
        const employeeTotal = partyKey
          ? rows
              .filter((r) => (r.partyCode.trim() || r.partyName.trim()) === partyKey)
              .reduce((sum, r) => sum + parseMoneyNumberInput(r.amount), 0)
          : rowAmount;
        const isExceeded = hasBalance && rowAmount > 0 && (rowAmount > balance || employeeTotal > balance);
        const warningMessage = isExceeded
          ? `Total Cash Advance Amount for ${row.partyName.trim() || "the employee"} cannot exceed the Available Cash Advance of ${formatCashAdvanceMultipleEntryAmount(balance)}.`
          : undefined;

        return (
          <ModuleDataEntryMoneyCell
            id={context.fieldId}
            name={context.fieldName}
            readOnly={isReadonly}
            value={row.amount}
            placeholder="0.00"
            isWarning={isExceeded}
            title={warningMessage}
            onChange={(value) => onUpdateEntry(row.id, { amount: value })}
          />
        );
      },
    },
    cashAdvanceLimit: {
      header: "Cash Advance Limit",
      id: "cashAdvanceLimit",
      width: 155,
      widthClassName: "w-[9.75rem]",
      renderCell: (row, _index, context) => {
        const employee = employeeOptions?.find((opt) => opt.partyCode === row.partyCode);
        const effectiveLimit = row.cashAdvanceLimit?.trim() || employee?.cashAdvanceLimit?.trim() || "";

        return (
          <ModuleDataEntryInputCell
            align="right"
            id={context.fieldId}
            name={context.fieldName}
            readOnly
            value={effectiveLimit ? formatCashAdvanceMultipleEntryAmount(effectiveLimit) : "Unlimited"}
          />
        );
      },
    },
    totalCashAdvanced: {
      header: "Total Cash Advances",
      id: "totalCashAdvanced",
      width: 165,
      widthClassName: "w-[10.25rem]",
      renderCell: (row, _index, context) => {
        const employee = employeeOptions?.find((opt) => opt.partyCode === row.partyCode);
        const effectiveLimit = row.cashAdvanceLimit?.trim() || employee?.cashAdvanceLimit?.trim() || "";
        const effectiveBalance = row.cashAdvanceBalance?.trim() || employee?.cashAdvanceBalance?.trim() || "";

        return (
          <ModuleDataEntryMoneyCell
            id={context.fieldId}
            name={context.fieldName}
            readOnly
            value={formatCashAdvanceMultipleEntryAmount(
              calculateTotalCashAdvanced(effectiveLimit, effectiveBalance),
            )}
          />
        );
      },
    },
    cashAdvanceBalance: {
      header: "Available Cash Advance",
      id: "cashAdvanceBalance",
      width: 155,
      widthClassName: "w-[9.75rem]",
      renderCell: (row, _index, context) => {
        const employee = employeeOptions?.find((opt) => opt.partyCode === row.partyCode);
        const effectiveBalance = row.cashAdvanceBalance?.trim() || employee?.cashAdvanceBalance?.trim() || "";

        return (
          <ModuleDataEntryInputCell
            align="right"
            id={context.fieldId}
            name={context.fieldName}
            readOnly
            value={effectiveBalance ? formatCashAdvanceMultipleEntryAmount(effectiveBalance) : "Unlimited"}
          />
        );
      },
    },
    responsibilityCenterCode: {
      header: "Responsibility Center Code",
      id: "responsibilityCenterCode",
      width: 155,
      widthClassName: "w-[9.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryInputCell
          id={context.fieldId}
          name={context.fieldName}
          readOnly
          value={getResponsibilityCenterCode(row.responsibilityCenter, responsibilityCenterOptions)}
        />
      ),
    },
    responsibilityCenter: {
      header: "Responsibility Center",
      id: "responsibilityCenter",
      width: 165,
      widthClassName: "w-[10.25rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          addAction={!isReadonly ? { label: "Add Responsibility Center", onClick: () => onOpenItemResponsibilityCenterDrawer(row.id) } : undefined}
          options={responsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          readOnly={isReadonly}
          value={row.responsibilityCenter}
          onChange={(value) => onUpdateEntry(row.id, { responsibilityCenter: value })}
        />
      ),
    },
    particulars: {
      header: "Particulars",
      id: "particulars",
      width: 300,
      widthClassName: "w-[18.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          isReadonly={isReadonly}
          dialogTitle="Particulars"
          value={row.particulars ?? row.remarks ?? ""}
          placeholder="Enter Particulars"
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => onUpdateEntry(row.id, { particulars: value, remarks: value })}
        />
      ),
    },
  };
}

export function createCashAdvanceMultipleEntryAccountingColumns({
  employeeOptions,
  isReadonly,
  onOpenAccountingPartyDrawer,
  onOpenAccountingResponsibilityCenterDrawer,
  onUpdateEntry,
  responsibilityCenterOptions,
}: CashAdvanceMultipleEntryAccountingColumnsParams): Record<
  string,
  ModuleDataEntryColumn<CashAdvanceMultipleEntryAccountingEntry>
> {
  const partySelectOptions = createPartyOptions("name", employeeOptions);
  const accountSelectOptions: AppAdvancedDropdownOption[] = [];

  return {
    accountCode: {
      header: "Account Code",
      id: "accountCode",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryInputCell id={context.fieldId} name={context.fieldName} readOnly value={row.accountCode} />
      ),
    },
    accountTitle: {
      header: "Account Title",
      id: "accountTitle",
      width: 220,
      widthClassName: "w-[13.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          options={accountSelectOptions}
          placeholder="Select Account Title"
          searchPlaceholder="Search Account Title"
          value={row.accountCode}
          onChange={(nextValue) => {
            const accountCode = String(nextValue);
            const account = accountSelectOptions.find((option) => option.value === accountCode);
            onUpdateEntry(row.id, { accountCode, accountTitle: account?.name ?? "" });
          }}
        />
      ),
    },
    credit: {
      header: "Credit",
      id: "credit",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryMoneyCell
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.credit}
          placeholder="0.00"
          onChange={(value) => onUpdateEntry(row.id, { credit: value })}
        />
      ),
    },
    debit: {
      header: "Debit",
      id: "debit",
      width: 140,
      widthClassName: "w-[8.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryMoneyCell
          id={context.fieldId}
          name={context.fieldName}
          readOnly={isReadonly}
          value={row.debit}
          placeholder="0.00"
          onChange={(value) => onUpdateEntry(row.id, { debit: value })}
        />
      ),
    },
    partyCode: {
      header: "Employee Code",
      id: "partyCode",
      width: 130,
      widthClassName: "w-[8.125rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryInputCell id={context.fieldId} name={context.fieldName} readOnly value={row.partyCode} />
      ),
    },
    partyName: {
      header: "Employee Name",
      id: "partyName",
      width: 200,
      widthClassName: "w-[12.5rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          options={partySelectOptions}
          placeholder="Select Employee Name"
          searchPlaceholder="Search Employee Name"
          readOnly={isReadonly}
          value={row.partyCode}
          addAction={!isReadonly ? { label: "Add Employee Name", onClick: () => onOpenAccountingPartyDrawer(row.id) } : undefined}
          onChange={(nextValue) => {
            const partyCode = String(nextValue);
            const employee = employeeOptions?.find((opt) => opt.partyCode === partyCode);
            onUpdateEntry(row.id, { partyCode, partyName: employee?.partyName ?? "" });
          }}
        />
      ),
    },
    responsibilityCenterCode: {
      header: "Responsibility Center Code",
      id: "responsibilityCenterCode",
      width: 155,
      widthClassName: "w-[9.75rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryInputCell
          id={context.fieldId}
          name={context.fieldName}
          readOnly
          value={getResponsibilityCenterCode(row.responsibilityCenter, responsibilityCenterOptions)}
        />
      ),
    },
    responsibilityCenter: {
      header: "Responsibility Center",
      id: "responsibilityCenter",
      width: 180,
      widthClassName: "w-[11.25rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryDropdownCell
          id={context.fieldId}
          name={context.fieldName}
          addAction={!isReadonly ? { label: "Add Responsibility Center", onClick: () => onOpenAccountingResponsibilityCenterDrawer(row.id) } : undefined}
          options={responsibilityCenterOptions}
          placeholder="Select Responsibility Center"
          searchPlaceholder="Search Responsibility Center"
          readOnly={isReadonly}
          value={row.responsibilityCenter}
          onChange={(value) => onUpdateEntry(row.id, { responsibilityCenter: value })}
        />
      ),
    },
    particulars: {
      header: "Particulars",
      id: "particulars",
      width: 260,
      widthClassName: "w-[16.25rem]",
      renderCell: (row, _index, context) => (
        <ModuleDataEntryRemarksCell
          inputId={context.fieldId}
          inputName={context.fieldName}
          isReadonly={isReadonly}
          dialogTitle="Particulars"
          value={row.particulars ?? row.remarks ?? ""}
          placeholder="Enter Particulars"
          textareaId={`${context.fieldId}-dialog`}
          onChange={(value) => onUpdateEntry(row.id, { particulars: value, remarks: value })}
        />
      ),
    },
  };
}

function createPartyOptions(
  optionDisplay: "code" | "name",
  employeeOptions?: CashAdvanceEmployeeOption[],
): AppAdvancedDropdownOption[] {
  const options = employeeOptions?.length
    ? employeeOptions.map((employee) => ({
        label: employee.partyCode,
        name: employee.partyName,
        value: employee.partyCode,
      }))
    : [];

  return options.map((option) => ({
    description: optionDisplay === "code" ? option.name : undefined,
    label: optionDisplay === "code" ? option.name : option.label,
    name: optionDisplay === "code" ? option.label : option.name,
    value: option.value,
  }));
}

function getAvailableEmployeeOptions(
  options: AppAdvancedDropdownOption[],
  rows: CashAdvanceMultipleEntryItem[],
  currentRowId: string,
) {
  const selectedEmployeeCodes = new Set(
    rows
      .filter((row) => row.id !== currentRowId)
      .map((row) => row.partyCode.trim())
      .filter(Boolean),
  );

  return options.filter((option) => !selectedEmployeeCodes.has(option.value));
}

function calculateTotalCashAdvanced(limitStr: string, balanceStr: string) {
  const limit = parseMoneyNumberInput(limitStr);
  const balance = parseMoneyNumberInput(balanceStr);

  if (!limitStr.trim() || !balanceStr.trim()) {
    return "";
  }

  return Math.max(0, limit - balance);
}

function getResponsibilityCenterCode(responsibilityCenter: string, options: AppAdvancedDropdownOption[]) {
  return options.find((option) => option.name === responsibilityCenter || option.value === responsibilityCenter)?.label ?? responsibilityCenter;
}
