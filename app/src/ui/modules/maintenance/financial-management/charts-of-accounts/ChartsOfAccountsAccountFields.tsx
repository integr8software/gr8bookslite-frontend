"use client";

import { Landmark } from "lucide-react";
import {
  AccountLevels,
  AccountCategories,
  AccountStatuses,
  AccountTypes,
  NormalBalances,
  StatementSections,
} from "@/app/src/constants/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsConstants";
import type {
  AccountLevel,
  ChartAccount,
  ChartAccountFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import {
  Field,
  Input,
  Select,
} from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsControls";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";

type AccountFieldsProps = {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  accountCodeError?: string;
  availableAccountLevels: AccountLevel[];
  isAccountCodeLoading?: boolean;
  submitted: boolean;
  values: ChartAccountFormValues;
  onFieldChange: <Key extends keyof ChartAccountFormValues>(
    key: Key,
    value: ChartAccountFormValues[Key],
  ) => void;
  onParentChange: (parentId: string | null) => void;
};

export function ChartsOfAccountsAccountFields({
  account,
  accounts,
  accountCodeError,
  availableAccountLevels,
  isAccountCodeLoading = false,
  submitted,
  values,
  onFieldChange,
  onParentChange,
}: AccountFieldsProps) {
  const isInvalid = submitted && (!values.accountNumber || !values.accountName);
  const showBankDetails = values.accountCategory === "Cash in Bank";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RequiredTextField
        error={
          accountCodeError ||
          (isInvalid && !values.accountNumber ? "Required" : undefined)
        }
        label="Account Number"
        placeholder={
          isAccountCodeLoading
            ? "Generating next code..."
            : "Generated automatically"
        }
        readOnly
        submitted={submitted}
        value={values.accountNumber}
        onChange={() => undefined}
      />
      <RequiredTextField
        error={isInvalid && !values.accountName ? "Required" : undefined}
        label="Account Name"
        placeholder="Cash in Bank - BDO"
        submitted={submitted}
        value={values.accountName}
        onChange={(value) => onFieldChange("accountName", value)}
      />

      <ParentAccountField
        account={account}
        accounts={accounts}
        value={values.parentId}
        onChange={onParentChange}
      />
      <SelectField
        label="Account Level"
        value={values.accountLevel}
        options={
          availableAccountLevels.length ? availableAccountLevels : AccountLevels
        }
        onChange={(value) =>
          onFieldChange("accountLevel", value as AccountLevel)
        }
      />

      <SelectField
        label="Account Type"
        value={values.accountType}
        options={AccountTypes}
        onChange={(value) => onFieldChange("accountType", value as never)}
      />
      <SelectField
        label="Statement Section"
        value={values.statementSection}
        options={StatementSections}
        onChange={(value) => onFieldChange("statementSection", value)}
      />
      <SelectField
        label="Account Nature"
        value={values.normalBalance}
        options={NormalBalances}
        onChange={(value) => onFieldChange("normalBalance", value as never)}
      />
      <PostingAccountField
        checked={values.isPostingAccount}
        onChange={(checked) => onFieldChange("isPostingAccount", checked)}
      />
      <SelectField
        label="Account Category"
        value={values.accountCategory}
        options={AccountCategories}
        onChange={(value) => onFieldChange("accountCategory", value as never)}
      />

      <DescriptionField
        value={values.description}
        onChange={(value) => onFieldChange("description", value)}
      />

      <SelectField
        label="Status"
        value={values.status}
        options={AccountStatuses}
        onChange={(value) => onFieldChange("status", value as never)}
      />

      <ReportsField
        checked={values.showInReports}
        onChange={(checked) => onFieldChange("showInReports", checked)}
      />

      {showBankDetails ? <BankDetailsNotice /> : null}
    </div>
  );
}

function RequiredTextField({
  error,
  label,
  placeholder,
  readOnly,
  submitted,
  value,
  onChange,
}: {
  error?: string;
  label: string;
  placeholder: string;
  readOnly?: boolean;
  submitted: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} error={error}>
      <Input
        readOnly={readOnly}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={
          readOnly
            ? "bg-darknavy/[0.03] text-darknavy/75"
            : submitted && !value
              ? "border-red-300 ring-2 ring-red-100"
              : undefined
        }
        placeholder={placeholder}
      />
    </Field>
  );
}

function ParentAccountField({
  account,
  accounts,
  value,
  onChange,
}: {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <Field label="Parent Account">
      <Select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">No parent account</option>
        {accounts
          .filter(
            (item) =>
              item.id !== account?.id && item.accountLevel !== "SPECIFIC",
          )
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.accountNumber} - {item.accountName}
            </option>
          ))}
      </Select>
    </Field>
  );
}

function PostingAccountField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-darknavy/10 px-3 py-2.5">
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
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-darknavy/20 text-skyblue focus:ring-2 focus:ring-skyblue/20"
      />
    </label>
  );
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </Field>
  );
}

function DescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label="Description" className="sm:col-span-2">
      <AppLimitedTextarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Internal reporting notes"
        className="min-h-24 w-full rounded-lg border border-darknavy/10 bg-white px-3 py-2 text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
        counterMode="used"
      />
    </Field>
  );
}

function ReportsField({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-darknavy/10 px-3 py-2.5">
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
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-darknavy/20 text-skyblue focus:ring-2 focus:ring-skyblue/20"
      />
    </label>
  );
}

function BankDetailsNotice() {
  return (
    <div className="rounded-xl border border-skyblue/25 bg-skyblue/10 p-4 sm:col-span-2">
      <div className="flex items-start gap-3">
        <Landmark className="mt-0.5 h-5 w-5 text-skyblue" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-darknavy">
            Bank details enabled
          </p>
          <p className="mt-1 text-sm text-darknavy/60">
            Use the Bank Details tab to maintain branch, currency, and opening
            balance information.
          </p>
        </div>
      </div>
    </div>
  );
}
