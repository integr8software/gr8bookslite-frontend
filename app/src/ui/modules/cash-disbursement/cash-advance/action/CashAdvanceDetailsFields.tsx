"use client";

import { useEffect, useMemo, useState } from "react";
import { CashAdvanceTabs } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import {
  createProjectResponsibilityCenterInitialValues,
  ResponsibilityCenterInitialFormValues,
} from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { usePartyLookup } from "@/app/src/hooks/modules/party-management/usePartyLookup";
import { usePostingAccountLookup } from "@/app/src/hooks/modules/financial-maintenance/charts-of-accounts/useChartOfAccountsLookup";
import { useResponsibilityCenterSplitLookup } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenterLookup";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import type {
  CashAdvanceAccountDropdownOption,
  CashAdvanceActionMode,
  CashAdvanceDetailsSection,
  CashAdvanceFormController,
  CashAdvancePartyDropdownOption,
  CashAdvanceResponsibilityCenterDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  ResponsibilityCenterClassification,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { formatMoneyNumberDisplayValue, MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import { CashAdvanceFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceFileAttachmentFields";

export function CashAdvanceFormPanel({
  mode = "add",
  recordId,
  onSaved,
}: {
  mode?: CashAdvanceActionMode;
  onSaved?: () => void;
  recordId?: string;
}) {
  const form = useCashAdvanceActionForm(mode, recordId, onSaved);

  return <CashAdvanceDetailsForm form={form} mode={mode} />;
}

function applyPartyDefaultAccount(
  form: CashAdvanceFormController,
  accountOptions: CashAdvanceAccountDropdownOption[],
  party?: {
    employeeAdvanceAccountId?: string;
    employeeAdvanceAccountCode?: string;
    employeeAdvanceAccountTitle?: string;
  },
) {
  if (!party) return;

  const matchingAccount = accountOptions.find(
    (account) =>
      (party.employeeAdvanceAccountId &&
        (account.accountId === party.employeeAdvanceAccountId || account.value === party.employeeAdvanceAccountId)) ||
      (party.employeeAdvanceAccountCode &&
        (account.accountCode === party.employeeAdvanceAccountCode || account.label === party.employeeAdvanceAccountCode)) ||
      (party.employeeAdvanceAccountTitle &&
        (account.accountTitle === party.employeeAdvanceAccountTitle || account.name === party.employeeAdvanceAccountTitle)),
  );

  const accountId = matchingAccount?.accountId || matchingAccount?.value || party.employeeAdvanceAccountId || "";
  const accountCode = matchingAccount?.accountCode || matchingAccount?.label || party.employeeAdvanceAccountCode || "";
  const accountTitle = matchingAccount?.accountTitle || matchingAccount?.name || party.employeeAdvanceAccountTitle || "";

  if (accountCode || accountTitle) {
    form.updateField("accountId", accountId);
    form.updateField("accountCode", accountCode);
    form.updateField("accountTitle", accountTitle);
    form.updateReferenceField("accountCode", accountCode);
  }
}

export function CashAdvanceDetailsForm({ form, mode }: { form: CashAdvanceFormController; mode: CashAdvanceActionMode }) {
  const [activeTab, setActiveTab] = useState<CashAdvanceDetailsSection>("advance");
  const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const partyStore = usePartyManagementStore();
  const partyQuery = usePartyLookup();
  const accountQuery = usePostingAccountLookup();
  const rcSplitQuery = useResponsibilityCenterSplitLookup();

  const accountOptions = useMemo<CashAdvanceAccountDropdownOption[]>(() => {
    const options: CashAdvanceAccountDropdownOption[] = (accountQuery.data ?? []).map((account) => ({
      name: account.accountTitle || account.name,
      label: account.accountCode || account.label,
      value: account.accountId || account.value,
      accountId: account.accountId || account.value,
      accountCode: account.accountCode || account.label,
      accountTitle: account.accountTitle || account.name,
    }));

    if (
      form.values.accountCode &&
      !options.some((option) => option.value === form.values.accountId || option.label === form.values.accountCode)
    ) {
      options.unshift({
        name: form.values.accountTitle || form.values.accountCode,
        label: form.values.accountCode,
        value: form.values.accountId || form.values.accountCode,
        accountId: form.values.accountId,
        accountCode: form.values.accountCode,
        accountTitle: form.values.accountTitle,
      });
    }

    return options;
  }, [accountQuery.data, form.values.accountCode, form.values.accountId, form.values.accountTitle]);

  const costCenterOptions = useMemo<CashAdvanceResponsibilityCenterDropdownOption[]>(() => {
    const options: CashAdvanceResponsibilityCenterDropdownOption[] = rcSplitQuery.costCenterOptions.map((rc) => ({
      name: rc.name,
      label: rc.code || rc.label,
      value: rc.centerId || rc.value,
      id: rc.centerId || rc.value,
      code: rc.code || rc.label,
    }));

    if (
      form.values.costCenter &&
      !options.some((option) => option.value === form.values.costCenterId || option.name === form.values.costCenter)
    ) {
      options.unshift({
        name: form.values.costCenter,
        label: form.values.referenceFields.costCenterCode || form.values.costCenter,
        value: form.values.costCenterId || form.values.costCenter,
        id: form.values.costCenterId,
        code: form.values.referenceFields.costCenterCode,
      });
    }

    return options;
  }, [
    form.values.costCenter,
    form.values.costCenterId,
    form.values.referenceFields.costCenterCode,
    rcSplitQuery.costCenterOptions,
  ]);

  const projectOptions = useMemo<CashAdvanceResponsibilityCenterDropdownOption[]>(() => {
    const options: CashAdvanceResponsibilityCenterDropdownOption[] = rcSplitQuery.projectOptions.map((rc) => ({
      name: rc.name,
      label: rc.code || rc.label,
      value: rc.centerId || rc.value,
      id: rc.centerId || rc.value,
      code: rc.code || rc.label,
    }));

    if (
      form.values.referenceFields.projectName &&
      !options.some((option) => option.value === form.values.projectId || option.name === form.values.referenceFields.projectName)
    ) {
      options.unshift({
        name: form.values.referenceFields.projectName,
        label: form.values.referenceFields.projectCode || form.values.referenceFields.projectName,
        value: form.values.projectId || form.values.referenceFields.projectName,
        id: form.values.projectId,
        code: form.values.referenceFields.projectCode,
      });
    }

    return options;
  }, [
    form.values.projectId,
    form.values.referenceFields.projectCode,
    form.values.referenceFields.projectName,
    rcSplitQuery.projectOptions,
  ]);

  const partyOptions = useMemo<CashAdvancePartyDropdownOption[]>(() => {
    const options: CashAdvancePartyDropdownOption[] = (partyQuery.data ?? []).map((party) => ({
      name: party.partyName || party.name,
      label: party.partyCode || party.label,
      value: party.partyId || party.value,
      partyId: party.partyId || party.value,
      partyCode: party.partyCode || party.label,
      partyName: party.partyName || party.name,
      availableCashAdvance: (party as unknown as { availableCashAdvance?: number }).availableCashAdvance,
      cashAdvanceLimit: (party as unknown as { cashAdvanceLimit?: number }).cashAdvanceLimit,
      totalCashAdvance: (party as unknown as { totalCashAdvance?: number }).totalCashAdvance,
    }));

    if (
      form.values.partyCode &&
      !options.some((option) => option.value === form.values.partyId || option.label === form.values.partyCode)
    ) {
      options.unshift({
        name: form.values.partyName || form.values.partyCode,
        label: form.values.partyCode,
        value: form.values.partyId || form.values.partyCode,
        partyId: form.values.partyId,
        partyCode: form.values.partyCode,
        partyName: form.values.partyName,
        availableCashAdvance: form.values.availableCashAdvance,
        cashAdvanceLimit: form.values.cashAdvanceLimit,
      });
    }

    return options;
  }, [
    form.values.availableCashAdvance,
    form.values.cashAdvanceLimit,
    form.values.partyCode,
    form.values.partyId,
    form.values.partyName,
    partyQuery.data,
  ]);

  const selectedParty = useMemo(
    () => partyOptions.find((party) => party.value === form.values.partyId || party.partyCode === form.values.partyCode),
    [form.values.partyCode, form.values.partyId, partyOptions],
  );

  const totalAdvanced = Number(selectedParty?.totalCashAdvance ?? 0);
  const isAccountLookupLoading = accountQuery.isLoading;
  const isCostCenterLookupLoading = rcSplitQuery.isLoading;
  const isPartyLookupError = partyQuery.isError;
  const isPartyLookupLoading = partyQuery.isLoading;
  const isProjectLookupLoading = rcSplitQuery.isLoading;

  const costCenterInitialValues = useMemo(
    () => createCostCenterInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );

  const projectInitialValues = useMemo(
    () => createProjectInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );

  useEffect(() => {
    if (!selectedParty) return;

    if (!form.values.availableCashAdvance && selectedParty.availableCashAdvance) {
      form.updateField("availableCashAdvance", selectedParty.availableCashAdvance);
    }
    if (!form.values.cashAdvanceLimit && selectedParty.cashAdvanceLimit) {
      form.updateField("cashAdvanceLimit", selectedParty.cashAdvanceLimit);
    }
    if (
      !form.values.accountCode &&
      (selectedParty.employeeAdvanceAccountId ||
        selectedParty.employeeAdvanceAccountCode ||
        selectedParty.employeeAdvanceAccountTitle)
    ) {
      applyPartyDefaultAccount(form, accountOptions, selectedParty);
    }
  }, [accountOptions, form, selectedParty]);

  const isReadonly = mode === "view";

  return (
    <>
      <section className="grid min-w-0 gap-5 overflow-visible">
        <ModuleTabs activeTab={activeTab} ariaLabel="Cash advance sections" tabs={CashAdvanceTabs} onTabChange={setActiveTab} />

        {isPartyLookupError ? (
          <p role="alert" className="rounded-lg border border-coralpink/30 bg-coralpink/5 px-4 py-3 text-sm text-darknavy">
            Party lookup options could not be loaded. Please refresh the page.
          </p>
        ) : null}

        {activeTab === "advance" ? (
          <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
            <CashAdvancePrimaryFields
              accountOptions={accountOptions}
              costCenterOptions={costCenterOptions}
              currencyOptions={form.currencyOptions}
              form={form}
              isAccountLookupLoading={isAccountLookupLoading}
              isCostCenterLookupLoading={isCostCenterLookupLoading}
              isPartyLookupLoading={isPartyLookupLoading}
              isProjectLookupLoading={isProjectLookupLoading}
              isReadonly={isReadonly}
              partyOptions={partyOptions}
              projectOptions={projectOptions}
              selectedParty={selectedParty}
              totalAdvanced={totalAdvanced}
              onOpenCostCenterDrawer={() => setIsCostCenterDrawerOpen(true)}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
              onUpdateCurrency={form.updateCurrency}
            />
          </section>
        ) : (
          <CashAdvanceFileAttachmentFields
            attachments={form.values.attachments}
            isReadonly={isReadonly}
            onAttachmentsChange={(attachments) => form.updateField("attachments", attachments)}
          />
        )}
      </section>
      {!isReadonly && isPartyDrawerOpen ? (
        <PartyManagementDrawer
          isOpen
          isPending={partyStore.isMutating}
          records={partyStore.records}
          suggestedPartyType="Employee"
          title="Add Employee"
          onAddRecord={partyStore.addRecord}
          onClose={() => setIsPartyDrawerOpen(false)}
          onCreateParty={(record: PartyInformationRecord) => {
            const partyName = getPartyDisplayName(record);

            form.updateField("partyId", record.id);
            form.updateField("partyCode", record.partyCodeNo);
            form.updateField("partyName", partyName);
            form.updateField("availableCashAdvance", record.cashAdvanceLimit ?? "");
            form.updateField("cashAdvanceLimit", record.cashAdvanceLimit ?? "");
            form.updateReferenceField("partyCode", record.partyCodeNo);

            if (record.employeeAdvanceAccount) {
              applyPartyDefaultAccount(form, accountOptions, {
                employeeAdvanceAccountId: record.employeeAdvanceAccount,
              });
            }

            setIsPartyDrawerOpen(false);
          }}
        />
      ) : null}
      <ResponsibilityCenterDrawer
        initialValues={costCenterInitialValues}
        isOpen={!isReadonly && isCostCenterDrawerOpen}
        mode="add"
        onClose={() => setIsCostCenterDrawerOpen(false)}
        onSaved={(center) => {
          form.updateField("costCenterId", center.id);
          form.updateField("costCenter", center.name);
          form.updateReferenceField("costCenterCode", center.code);
          setIsCostCenterDrawerOpen(false);
        }}
      />
      <ResponsibilityCenterDrawer
        initialValues={projectInitialValues}
        isOpen={!isReadonly && isProjectDrawerOpen}
        mode="add"
        onClose={() => setIsProjectDrawerOpen(false)}
        onSaved={(center) => {
          form.updateField("projectId", center.id);
          form.updateReferenceField("projectName", center.name);
          form.updateReferenceField("projectCode", center.code);
          setIsProjectDrawerOpen(false);
        }}
      />
    </>
  );
}

function CashAdvancePrimaryFields({
  accountOptions,
  costCenterOptions,
  currencyOptions,
  form,
  isAccountLookupLoading,
  isCostCenterLookupLoading,
  isPartyLookupLoading,
  isProjectLookupLoading,
  isReadonly,
  onOpenCostCenterDrawer,
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onUpdateCurrency,
  partyOptions,
  projectOptions,
  selectedParty,
  totalAdvanced,
}: {
  accountOptions: CashAdvanceAccountDropdownOption[];
  costCenterOptions: CashAdvanceResponsibilityCenterDropdownOption[];
  currencyOptions: AppAdvancedDropdownOption[];
  form: CashAdvanceFormController;
  isAccountLookupLoading: boolean;
  isCostCenterLookupLoading: boolean;
  isPartyLookupLoading: boolean;
  isProjectLookupLoading: boolean;
  isReadonly: boolean;
  onOpenCostCenterDrawer: () => void;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onUpdateCurrency: (value: string) => void;
  partyOptions: CashAdvancePartyDropdownOption[];
  projectOptions: CashAdvanceResponsibilityCenterDropdownOption[];
  selectedParty?: CashAdvancePartyDropdownOption;
  totalAdvanced: number;
}) {
  const effectiveLimit = form.values.cashAdvanceLimit?.trim() || selectedParty?.cashAdvanceLimit?.trim() || "";
  const effectiveAvailable = form.values.availableCashAdvance?.trim() || selectedParty?.availableCashAdvance?.trim() || "";
  const cashAdvanceLimitDisplay = effectiveLimit ? formatMoneyNumberDisplayValue(effectiveLimit) : "Unlimited";
  const availableCashAdvanceDisplay = effectiveAvailable ? formatMoneyNumberDisplayValue(effectiveAvailable) : "Unlimited";
  const totalCashAdvanceDisplay = formatMoneyNumberDisplayValue(String(totalAdvanced));

  const selectedPartyValue = form.values.partyId || form.values.partyCode;
  const selectedAccountValue = form.values.accountId || form.values.accountCode;
  const selectedCostCenterValue = form.values.costCenterId || form.values.costCenter;
  const selectedProjectValue = form.values.projectId || form.values.referenceFields.projectName;

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {/* Column 1: Name & Lookup Fields */}
      <div className="grid min-w-0 content-start gap-5">
        <TransactionField label="Party Name" error={form.errors.partyName} isRequired>
          <AppLookupDropdown
            value={selectedPartyValue}
              options={partyOptions}
              readOnly={isReadonly}
              placeholder="Select Party Name"
              searchPlaceholder="Search Party Name"
              emptyMessage={isPartyLookupLoading ? "Loading Party Name options..." : "No Party Name options found."}
            addAction={!isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
            onChange={(selectedId, selectedName) => {
              const party = partyOptions.find(
                (option) => option.value === selectedId || option.partyId === selectedId || option.partyCode === selectedId,
              );

              form.updateField("partyId", party?.partyId || party?.value || selectedId);
              form.updateField("partyCode", party?.partyCode || party?.label || "");
              form.updateField("partyName", party?.partyName || party?.name || selectedName);
              form.updateField("availableCashAdvance", party?.availableCashAdvance ?? "");
              form.updateField("cashAdvanceLimit", party?.cashAdvanceLimit ?? "");
              form.updateReferenceField("partyCode", party?.partyCode || party?.label || "");

              applyPartyDefaultAccount(form, accountOptions, party);
            }}
          />
        </TransactionField>

        <TransactionField label="Default Account Title" error={form.errors.accountTitle} isRequired>
          <AppLookupDropdown
            value={selectedAccountValue}
              options={accountOptions}
              readOnly={isReadonly}
              placeholder="Select Default Account Title"
              searchPlaceholder="Search Default Account Title"
              emptyMessage={isAccountLookupLoading ? "Loading Default Account options..." : "No Default Account options found."}
            onChange={(selectedId, selectedTitle) => {
              const account = accountOptions.find(
                (option) => option.value === selectedId || option.accountId === selectedId || option.accountCode === selectedId,
              );

              form.updateField("accountId", account?.accountId || account?.value || selectedId);
              form.updateField("accountCode", account?.accountCode || account?.label || "");
              form.updateField("accountTitle", account?.accountTitle || account?.name || selectedTitle);
              form.updateReferenceField("accountCode", account?.accountCode || account?.label || "");
            }}
          />
        </TransactionField>

        <TransactionField label="Responsibility Center">
          <AppLookupDropdown
            value={selectedCostCenterValue}
            options={costCenterOptions}
            readOnly={isReadonly}
            placeholder="Select Responsibility Center"
            searchPlaceholder="Search Responsibility Center"
            emptyMessage={isCostCenterLookupLoading ? "Loading Responsibility Center options..." : "No Responsibility Center options found."}
            addAction={!isReadonly ? { label: "Add Responsibility Center", onClick: onOpenCostCenterDrawer } : undefined}
            onChange={(selectedId, selectedName) => {
              const option = costCenterOptions.find(
                (currentOption) =>
                  currentOption.value === selectedId ||
                  currentOption.id === selectedId ||
                  currentOption.name === selectedId ||
                  currentOption.code === selectedId,
              );

              form.updateField("costCenterId", option?.id || option?.value || selectedId);
              form.updateField("costCenter", option?.name || selectedName);
              form.updateReferenceField("costCenterCode", option?.label || option?.code || "");
            }}
          />
        </TransactionField>

        <TransactionField label="Project Name">
          <AppLookupDropdown
            value={selectedProjectValue}
            options={projectOptions}
            readOnly={isReadonly}
            placeholder="Select Project Name"
            searchPlaceholder="Search Project Name"
            emptyMessage={isProjectLookupLoading ? "Loading Project Name options..." : "No Project Name options found."}
            addAction={!isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined}
            onChange={(selectedId, selectedName) => {
              const project = projectOptions.find(
                (option) =>
                  option.value === selectedId || option.id === selectedId || option.name === selectedId || option.code === selectedId,
              );

              form.updateField("projectId", project?.id || project?.value || selectedId);
              form.updateReferenceField("projectName", project?.name || selectedName);
              form.updateReferenceField("projectCode", project?.label || project?.code || "");
            }}
          />
        </TransactionField>

        <TransactionField label="Remarks">
          <AppLimitedTextarea
            value={form.values.remarks}
            onChange={(event) => form.updateField("remarks", event.target.value)}
            readOnly={isReadonly}
            className={`${TransactionFieldClassName} min-h-28 max-w-full resize py-3`}
            counterMode="used"
            placeholder="Optional Remarks"
          />
        </TransactionField>
      </div>

      {/* Column 2: Aligned Code & Financial Fields */}
      <div className="grid min-w-0 content-start gap-5">
        <TransactionTextField
          value={form.values.partyCode}
          isReadonly
          isRequired
          label="Party Code"
          error={form.errors.partyCode}
          onValueChange={(value) => form.updateField("partyCode", value)}
          placeholder="Party Code"
        />

        <TransactionTextField
          value={form.values.accountCode}
          isReadonly
          isRequired
          label="Default Account Code"
          error={form.errors.accountCode}
          onValueChange={(value) => form.updateField("accountCode", value)}
          placeholder="Default Account Code"
        />

        <TransactionTextField
          value={form.values.referenceFields.costCenterCode}
          isReadonly
          label="Responsibility Center Code"
          onValueChange={(value) => form.updateReferenceField("costCenterCode", value)}
          placeholder="Responsibility Center Code"
        />

        <TransactionTextField
          value={form.values.referenceFields.projectCode}
          isReadonly
          label="Project Code"
          onValueChange={(value) => form.updateReferenceField("projectCode", value)}
          placeholder="Project Code"
        />

        <CurrencyExchangeRateRow
          currencyLabel="Currency"
          currencyControlId="cash-advance-currency"
          exchangeRateControlId="cash-advance-fx-rate"
          currencyControl={
            <AppAdvancedDropdown
              id="cash-advance-currency"
              className="w-full min-w-0"
              value={form.values.currency}
              readOnly={isReadonly}
              isClearable={false}
              menuMinWidth={320}
              options={currencyOptions}
              placeholder="Currency"
              searchPlaceholder="Search Currency"
              onChange={(value) => onUpdateCurrency(String(value))}
            />
          }
          exchangeRateControl={
            <input
              id="cash-advance-fx-rate"
              type="text"
              inputMode="decimal"
              value={form.values.fxRate}
              readOnly={isReadonly}
              disabled={isReadonly || form.isExchangeRateLoading}
              onChange={(event) => form.updateField("fxRate", formatExchangeRateInput(event.target.value))}
              className={`${TransactionFieldClassName} text-right tabular-nums${isReadonly || form.isExchangeRateLoading ? " transaction-readonly-placeholder" : ""}`}
              placeholder="0.00"
            />
          }
        />

        <TransactionField label="Cash Advance Amount" error={form.errors.amount} isRequired>
          <MoneyNumberField
            min="0"
            value={form.values.amount}
            onValueChange={form.updateAmount}
            placeholder="0.00"
            readOnly={isReadonly}
            className={`${TransactionFieldClassName} text-right tabular-nums`}
          />
        </TransactionField>
      </div>

      {/* Column 3: Transaction Details & Status */}
      <div className="grid min-w-0 content-start gap-5">
        <TransactionTextField
          value={form.values.transNo}
          isReadonly
          isRequired
          label="CA No."
          error={form.errors.transNo}
          onValueChange={(value) => form.updateField("transNo", value)}
          placeholder="Auto Generated CA Transaction Number"
        />

        <TransactionTextField
          value={form.values.documentDate}
          isReadonly={isReadonly}
          isRequired
          label="CA Date"
          error={form.errors.documentDate}
          type="date"
          onValueChange={(value) => form.updateField("documentDate", value)}
        />

        <TransactionField label="Cash Advance Limit">
          <input
            className={`${TransactionFieldClassName} transaction-readonly-placeholder text-right tabular-nums`}
            value={cashAdvanceLimitDisplay}
            readOnly
          />
        </TransactionField>

        <TransactionField label="Total Cash Advance">
          <input
            className={`${TransactionFieldClassName} transaction-readonly-placeholder text-right tabular-nums`}
            value={totalCashAdvanceDisplay}
            readOnly
          />
        </TransactionField>

        <TransactionField label="Available Cash Advance">
          <input
            className={`${TransactionFieldClassName} transaction-readonly-placeholder text-right tabular-nums`}
            value={availableCashAdvanceDisplay}
            readOnly
          />
        </TransactionField>

        <TransactionTextField value={form.values.status} isReadonly label="Status" onValueChange={() => undefined} />
      </div>
    </div>
  );
}

function createCostCenterInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const costCenterType = types.find((type) => type.name.toLowerCase().includes("cost")) ?? types[0];
  const costCenterClassification =
    classifications.find((classification) => classification.id === costCenterType?.classificationId) ?? classifications[0];

  return {
    ...ResponsibilityCenterInitialFormValues,
    classificationId: costCenterClassification?.id ?? "",
    financialType: costCenterClassification?.name ?? "Cost Center",
    typeId: costCenterType?.id ?? "",
  };
}

function createProjectInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  return createProjectResponsibilityCenterInitialValues(classifications, types);
}
