"use client";

import { useId } from "react";
import {
  AccountLevelLabels,
  AccountStatuses,
  AccountTypeLabels,
  AccountTypes,
  NormalBalanceLabels,
  NormalBalances,
  StatementSections,
} from "@/app/src/constants/modules/maintenance/charts-of-accounts/ChartsOfAccountsConstants";
import type {
  AccountLevel,
  AccountType,
  ChartAccount,
  ChartsOfAccountsAccountFieldsProps,
  NormalBalance,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
  Field,
  Input,
  Select,
} from "@/app/src/ui/modules/maintenance/charts-of-accounts/ChartsOfAccountsControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import {
  AppAdvancedDropdown,
  type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

export function ChartsOfAccountsAccountFields({
  account,
  accounts,
  accountCodeError,
  accountNameError,
  availableAccountLevels,
  isAccountCodeLoading = false,
  isReadOnly = false,
  parentAccountError,
  submitted,
  values,
  onFieldChange,
  onParentChange,
}: ChartsOfAccountsAccountFieldsProps) {
  const standardNormalBalance = getStandardNormalBalance(values.accountType);
  const standardStatementSection = getStandardStatementSection(
    values.accountType,
  );
  const hasNonStandardNature =
    Boolean(values.accountType && values.normalBalance) &&
    values.normalBalance !== standardNormalBalance;
  const hasNonStandardStatementSection =
    Boolean(values.accountType && values.statementSection) &&
    values.statementSection !== standardStatementSection;
  const requiresParentAccount = values.accountLevel !== "MAJOR";
  const isEditing = Boolean(account);
  const isInvalid =
    submitted &&
    (!values.accountType ||
      !values.statementSection ||
      (requiresParentAccount && !values.parentId) ||
      !values.accountNumber ||
      !values.accountName ||
      !values.accountLevel ||
      !values.normalBalance ||
      !values.status);

  return (
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <SelectField
        error={isInvalid && !values.accountType ? "Required" : undefined}
        label="Account Type"
        value={values.accountType}
        options={AccountTypes}
        readOnly={isReadOnly}
        reserveMessageSpace={submitted}
        required
        getOptionLabel={(option) =>
          AccountTypeLabels[option as AccountType] ?? option
        }
        onChange={(value) => onFieldChange("accountType", value as never)}
      />
      <SelectField
        error={isInvalid && !values.statementSection ? "Required" : undefined}
        helper={
          hasNonStandardStatementSection
            ? `${AccountTypeLabels[values.accountType as AccountType]} accounts are usually reported under ${standardStatementSection}.`
            : undefined
        }
        label="Statement Section"
        value={values.statementSection}
        options={StatementSections}
        readOnly={isReadOnly}
        reserveMessageSpace={submitted}
        required
        onChange={(value) => onFieldChange("statementSection", value)}
      />

      <ParentAccountField
        account={account}
        accounts={accounts}
        accountType={values.accountType}
        disabled={!requiresParentAccount || (!isReadOnly && !values.accountType)}
        error={requiresParentAccount ? parentAccountError : undefined}
        readOnly={isReadOnly || isEditing}
        required={requiresParentAccount}
        submitted={submitted}
        value={values.parentId}
        onChange={onParentChange}
      />
      <SelectField
        disabled={!isReadOnly && !values.accountType}
        error={isInvalid && !values.normalBalance ? "Required" : undefined}
        helper={
          hasNonStandardNature
            ? `Standard ${AccountTypeLabels[values.accountType as AccountType]} nature is ${NormalBalanceLabels[standardNormalBalance as NormalBalance]}.`
            : undefined
        }
        label="Account Nature"
        value={values.normalBalance}
        options={NormalBalances}
        readOnly={isReadOnly || values.isBankLinked}
        reserveMessageSpace={submitted}
        required
        getOptionLabel={(option) =>
          NormalBalanceLabels[option as NormalBalance] ?? option
        }
        onChange={(value) => onFieldChange("normalBalance", value as never)}
      />

      <RequiredTextField
        error={
          accountCodeError ||
          (isInvalid && !values.accountNumber ? "Required" : undefined)
        }
        inputClassName="placeholder:italic"
        label="Account Code"
        placeholder={
          isAccountCodeLoading
            ? "Generating next code..."
            : values.parentId
              ? "Generated automatically"
              : "--Select Parent First--"
        }
        readOnly
        reserveMessageSpace={submitted}
        required
        submitted={submitted}
        value={values.accountNumber}
        onChange={() => undefined}
      />
      <SelectField
        disabled={
          (!isReadOnly && !values.parentId) ||
          availableAccountLevels.length <= 1
        }
        error={isInvalid && !values.accountLevel ? "Required" : undefined}
        label="Account Level"
        value={values.accountLevel}
        options={availableAccountLevels}
        includePlaceholder={false}
        readOnly={isReadOnly || isEditing}
        reserveMessageSpace={submitted}
        required
        getOptionLabel={(option) =>
          AccountLevelLabels[option as AccountLevel] ?? option
        }
        onChange={(value) => onFieldChange("accountLevel", value as never)}
      />

      <RequiredTextField
        autoFocus={!isReadOnly && !account && Boolean(values.parentId)}
        className="sm:col-span-2"
        error={
          accountNameError ||
          (isInvalid && !values.accountName ? "Required" : undefined)
        }
        label="Account Name"
        placeholder="Enter Account Title..."
        readOnly={isReadOnly}
        required
        submitted={submitted}
        value={values.accountName}
        onChange={(value) => onFieldChange("accountName", value)}
      />
      <DescriptionField
        readOnly={isReadOnly}
        value={values.description}
        onChange={(value) => onFieldChange("description", value)}
      />

      <PostingAccountField
        checked={values.isPostingAccount}
        disabled={isReadOnly || values.isBankLinked || values.accountLevel !== "SPECIFIC"}
        onChange={(checked) => onFieldChange("isPostingAccount", checked)}
      />
      <ReportsField
        checked={values.showInReports}
        disabled={isReadOnly}
        onChange={(checked) => onFieldChange("showInReports", checked)}
      />
      {values.showInReports ? (
        <RequiredTextField
          className="sm:col-span-2"
          label="Report Alias"
          placeholder="Enter Report Alias..."
          readOnly={isReadOnly}
          submitted={submitted}
          value={values.reportAlias}
          onChange={(value) => onFieldChange("reportAlias", value)}
        />
      ) : null}
      <SelectField
        error={isInvalid && !values.status ? "Required" : undefined}
        label="Status"
        value={values.status}
        options={AccountStatuses}
        includePlaceholder={false}
        readOnly={isReadOnly}
        reserveMessageSpace={submitted}
        required
        onChange={(value) => onFieldChange("status", value as never)}
      />
    </div>
  );
}

function RequiredTextField({
  autoFocus,
  error,
  className,
  inputClassName,
  label,
  placeholder,
  readOnly,
  reserveMessageSpace,
  required,
  submitted,
  value,
  onChange,
}: {
  autoFocus?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  label: string;
  placeholder: string;
  readOnly?: boolean;
  reserveMessageSpace?: boolean;
  required?: boolean;
  submitted: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <Field
      label={label}
      error={error}
      className={className}
      htmlFor={inputId}
      reserveMessageSpace={reserveMessageSpace}
      required={required}
    >
      <Input
        id={inputId}
        autoFocus={autoFocus}
        readOnly={readOnly}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={
          [
            readOnly
              ? "bg-darknavy/[0.03] text-darknavy/75"
              : required && submitted && !value
                ? "border-red-300 ring-2 ring-red-100"
                : "",
            inputClassName ?? "",
          ].join(" ")
        }
        placeholder={placeholder}
      />
    </Field>
  );
}

function ParentAccountField({
  account,
  accounts,
  accountType,
  disabled,
  error,
  readOnly,
  required = true,
  submitted,
  value,
  onChange,
}: {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  accountType: AccountType | "";
  disabled?: boolean;
  error?: string;
  readOnly?: boolean;
  required?: boolean;
  submitted: boolean;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const dropdownId = useId();

  return (
    <Field
      label="Parent Account"
      error={error}
      htmlFor={dropdownId}
      reserveMessageSpace={submitted}
      required={required}
    >
      <AppAdvancedDropdown
        ariaInvalid={Boolean(error)}
        className={readOnly ? "charts-of-accounts-readonly-dropdown" : undefined}
        disabled={disabled}
        emptyMessage="No parent accounts found."
        isClearable
        id={dropdownId}
        options={createParentAccountOptions(accounts, account, accountType)}
        placeholder={required ? "--Select Parent Account--" : "--No Parent Account--"}
        readOnly={readOnly}
        searchPlaceholder="Search account code or name"
        value={value ?? ""}
        onChange={(nextValue) =>
          onChange(
            Array.isArray(nextValue)
              ? nextValue[0] || null
              : nextValue || null,
          )
        }
      />
    </Field>
  );
}

function PostingAccountField({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={[
        "flex items-center justify-between rounded-lg border border-darknavy/10 px-3 py-2.5 transition",
        disabled
          ? "cursor-not-allowed bg-darknavy/[0.025]"
          : "bg-white hover:border-skyblue/40 hover:bg-skyblue/5",
      ].join(" ")}
    >
      <span>
        <span className="block text-sm font-semibold text-darknavy">
          Posting Account
        </span>
        <span className="text-xs text-darknavy/55">
          Only posting accounts may receive journal entries
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-darknavy/20 text-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function SelectField({
  disabled,
  error,
  helper,
  label,
  options,
  value,
  getOptionLabel,
  includePlaceholder = true,
  onChange,
  reserveMessageSpace = false,
  readOnly,
  required,
}: {
  disabled?: boolean;
  error?: string;
  getOptionLabel?: (value: string) => string;
  helper?: string;
  includePlaceholder?: boolean;
  label: string;
  options: readonly string[];
  readOnly?: boolean;
  reserveMessageSpace?: boolean;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectId = useId();

  return (
    <Field
      label={label}
      error={error}
      helper={helper}
      htmlFor={selectId}
      reserveMessageSpace={reserveMessageSpace}
      required={required}
    >
      <Select
        aria-readonly={readOnly || undefined}
        disabled={disabled}
        id={selectId}
        tabIndex={readOnly ? -1 : undefined}
        value={value}
        onChange={(event) => {
          if (!readOnly) {
            onChange(event.target.value);
          }
        }}
        className={
          readOnly
            ? "pointer-events-none cursor-default border-darknavy/10 bg-white text-darknavy/70 shadow-none"
            : undefined
        }
      >
        {includePlaceholder ? (
          <option value="">--Select {label}--</option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel?.(option) ?? option}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function DescriptionField({
  disabled,
  readOnly,
  value,
  onChange,
}: {
  disabled?: boolean;
  readOnly?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaId = useId();

  return (
    <Field
      label="Description"
      className="sm:col-span-2"
      htmlFor={textareaId}
    >
      <AppLimitedTextarea
        id={textareaId}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        maxLength={500}
        placeholder="Enter Description..."
        className={[
          "app-disabled-control min-h-24 w-full rounded-lg border border-darknavy/10 bg-white px-3 py-2 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.035] disabled:text-darknavy/35 disabled:placeholder:text-darknavy/32",
          readOnly
            ? "cursor-default bg-white text-darknavy/70 placeholder:text-darknavy/35"
            : "",
        ].join(" ")}
        counterMode="used"
      />
    </Field>
  );
}

function ReportsField({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={[
        "flex items-center justify-between rounded-lg border border-darknavy/10 px-3 py-2.5 transition",
        disabled
          ? "cursor-not-allowed bg-darknavy/[0.025]"
          : "bg-white hover:border-skyblue/40 hover:bg-skyblue/5",
      ].join(" ")}
    >
      <span>
        <span className="block text-sm font-semibold text-darknavy">
          Show in Reports
        </span>
        <span className="text-xs text-darknavy/55">
          Include this account in financial statements
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-darknavy/20 text-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function getStandardNormalBalance(accountType: AccountType | ""): NormalBalance | "" {
  if (!accountType) {
    return "";
  }

  return accountType === "ASSET" || accountType === "EXPENSE"
    ? "DEBIT"
    : "CREDIT";
}

function getStandardStatementSection(accountType: AccountType | "") {
  if (!accountType) {
    return "";
  }

  return accountType === "REVENUE" || accountType === "EXPENSE"
    ? "Income Statement"
    : "Balance Sheet";
}

function createParentAccountOptions(
  accounts: ChartAccount[],
  account: ChartAccount | null,
  accountType: AccountType | "",
): AppAdvancedDropdownOption[] {
  return flattenChartAccounts(accounts)
    .filter((item) => {
      const isCurrentAccount = item.id === account?.id;
      const isSpecific = item.accountLevel === "SPECIFIC";
      const isDescendant = account
        ? isDescendantAccount(account, item.id)
        : false;

      return !isCurrentAccount && !isSpecific && !isDescendant;
    })
    .filter((item) => !accountType || item.accountType === accountType)
    .map((item) => ({
      description: item.description || AccountTypeLabels[item.accountType],
      label: item.accountNumber,
      name: item.accountName,
      value: item.id,
    }));
}

function isDescendantAccount(account: ChartAccount, ancestorAccountId: string): boolean {
  return (account.children ?? []).some(
    (child) =>
      child.id === ancestorAccountId ||
      isDescendantAccount(child, ancestorAccountId),
  );
}

function flattenChartAccounts(accounts: ChartAccount[]): ChartAccount[] {
  return flattenUniqueChartAccounts(accounts, new Set<string>());
}

function flattenUniqueChartAccounts(
  accounts: ChartAccount[],
  visitedAccountIds: Set<string>,
): ChartAccount[] {
  return accounts.flatMap((account) => {
    if (visitedAccountIds.has(account.id)) {
      return [];
    }

    visitedAccountIds.add(account.id);

    return [
      account,
      ...flattenUniqueChartAccounts(account.children ?? [], visitedAccountIds),
    ];
  });
}


