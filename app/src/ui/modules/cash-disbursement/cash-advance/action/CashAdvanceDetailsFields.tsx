"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CashAdvanceTabs } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import {
  createProjectResponsibilityCenterInitialValues,
  ResponsibilityCenterInitialFormValues,
} from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import {
  fetchCashAdvanceAccountOptions,
  fetchCashAdvancePartyOptions,
  fetchCashAdvanceResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/cash-advance/CashAdvanceApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
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

export function CashAdvanceDetailsForm({ form, mode }: { form: CashAdvanceFormController; mode: CashAdvanceActionMode }) {
  const [activeTab, setActiveTab] = useState<CashAdvanceDetailsSection>("advance");
  const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const partyStore = usePartyManagementStore();

  // 1. Fetch live Party options (Party Name: title, Party Code: subtitle, Primary Key ID: value)
  const partyQuery = useQuery({
    queryKey: PartyManagementQueryKeys.cashAdvancePartyOptions(),
    queryFn: fetchCashAdvancePartyOptions,
  });

  // 2. Fetch live Accounts Receivables (1010103000) posting account options
  const accountQuery = useQuery({
    queryKey: ["cash-disbursement", "cash-advance", "account-options"],
    queryFn: fetchCashAdvanceAccountOptions,
  });

  // 3. Fetch live Responsibility Centers (separated into Non-Project cost centers & Project-only centers)
  const rcQuery = useQuery({
    queryKey: ["cash-disbursement", "cash-advance", "rc-options"],
    queryFn: fetchCashAdvanceResponsibilityCenters,
  });

  const accountOptions = useMemo(() => {
    const rawOptions = accountQuery.data ?? [];
    const options = [...rawOptions];

    if (form.values.accountCode && !options.some((opt) => opt.value === form.values.accountId || opt.label === form.values.accountCode)) {
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

  const costCenterOptions = useMemo(() => {
    const rawOptions = rcQuery.data?.costCenters ?? [];
    const options = [...rawOptions];

    if (form.values.costCenter && !options.some((opt) => opt.value === form.values.costCenterId || opt.name === form.values.costCenter)) {
      options.unshift({
        name: form.values.costCenter,
        label: form.values.referenceFields.costCenterCode || form.values.costCenter,
        value: form.values.costCenterId || form.values.costCenter,
        id: form.values.costCenterId,
        code: form.values.referenceFields.costCenterCode,
      });
    }

    return options;
  }, [form.values.costCenter, form.values.costCenterId, form.values.referenceFields.costCenterCode, rcQuery.data?.costCenters]);

  const projectOptions = useMemo(() => {
    const rawOptions = rcQuery.data?.projects ?? [];
    const options = [...rawOptions];

    if (
      form.values.referenceFields.projectName &&
      !options.some((opt) => opt.value === form.values.projectId || opt.name === form.values.referenceFields.projectName)
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
  }, [form.values.projectId, form.values.referenceFields.projectCode, form.values.referenceFields.projectName, rcQuery.data?.projects]);

  const partyOptions = useMemo(() => {
    const rawOptions = partyQuery.data ?? [];
    const options = [...rawOptions];

    if (form.values.partyCode && !options.some((opt) => opt.value === form.values.partyId || opt.label === form.values.partyCode)) {
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

  const costCenterInitialValues = useMemo(
    () => createCostCenterInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );

  const projectInitialValues = useMemo(
    () => createProjectInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );

  const selectedParty = useMemo(
    () => partyOptions.find((p) => p.value === form.values.partyId || p.partyCode === form.values.partyCode),
    [form.values.partyCode, form.values.partyId, partyOptions],
  );

  useEffect(() => {
    if (!selectedParty) return;

    if (!form.values.availableCashAdvance && selectedParty.availableCashAdvance) {
      form.updateField("availableCashAdvance", selectedParty.availableCashAdvance);
    }
    if (!form.values.cashAdvanceLimit && selectedParty.cashAdvanceLimit) {
      form.updateField("cashAdvanceLimit", selectedParty.cashAdvanceLimit);
    }
  }, [form, selectedParty]);

  const totalAdvanced = useMemo(() => {
    return Number(selectedParty?.totalCashAdvance ?? 0);
  }, [selectedParty?.totalCashAdvance]);

  const isReadonly = mode === "view";

  return (
    <>
      <section className="grid min-w-0 gap-5 overflow-visible">
        <ModuleTabs activeTab={activeTab} ariaLabel="Cash advance sections" tabs={CashAdvanceTabs} onTabChange={setActiveTab} />

        {partyQuery.isError ? (
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
