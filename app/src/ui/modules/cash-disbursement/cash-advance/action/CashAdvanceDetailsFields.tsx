"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  DisbursementVoucherPartyOptions,
  DisbursementVoucherProjectOptions,
  createVoucherCurrencyOptions,
  getVoucherCurrencyExchangeRate,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceCostCenterOptions,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { ResponsibilityCenterInitialFormValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import type { CashAdvanceActionMode } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type {
  ResponsibilityCenter,
  ResponsibilityCenterClassification,
  ResponsibilityCenterFormValues,
  ResponsibilityCenterTypeOption,
} from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { formatExchangeRateInput } from "@/app/src/utils/number.util";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
import {
  AppPartyDialog,
  mapPartyRecordToPartyValue,
} from "@/app/src/ui/shared/transaction-setup/AppPartyDialog";
import { CashAdvanceFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceFileAttachmentFields";

export type CashAdvanceDetailsSection = "advance" | "attachment";
export type CashAdvanceFormController = ReturnType<typeof useCashAdvanceActionForm>;

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

  return (
    <CashAdvanceDetailsForm form={form} mode={mode} />
  );
}

export function CashAdvanceDetailsForm({
  form,
  mode,
}: {
  form: CashAdvanceFormController;
  mode: CashAdvanceActionMode;
}) {
  const [activeTab, setActiveTab] = useState<CashAdvanceDetailsSection>("advance");
  const [isCostCenterDrawerOpen, setIsCostCenterDrawerOpen] = useState(false);
  const [isPartyDialogOpen, setIsPartyDialogOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const accountOptions = useMemo(() => createCashAdvanceSelectDropdownOptions(CashAdvanceAccountOptions), []);
  const costCenterOptions = useMemo(
    () =>
      createCashAdvanceCostCenterDropdownOptions({
        centers: responsibilityCenterStore.centers,
        currentCostCenter: form.values.costCenter,
      }),
    [form.values.costCenter, responsibilityCenterStore.centers],
  );
  const costCenterInitialValues = useMemo(
    () =>
      createCostCenterInitialValues(
        responsibilityCenterStore.classifications,
        responsibilityCenterStore.types,
      ),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );
  const currencyOptions = useMemo(() => createCashAdvanceCurrencyDropdownOptions(), []);
  const partyOptions = useMemo(
    () =>
      createCashAdvancePartyOptions({
        currentPartyCode: form.values.partyCode,
        currentPartyName: form.values.partyName,
      }),
    [form.values.partyCode, form.values.partyName],
  );
  const projectOptions = useMemo(
    () =>
      createCashAdvanceProjectDropdownOptions({
        centers: responsibilityCenterStore.centers,
        currentProjectCode: form.values.referenceFields.projectCode,
        currentProjectName: form.values.referenceFields.projectRef,
      }),
    [
      form.values.referenceFields.projectCode,
      form.values.referenceFields.projectRef,
      responsibilityCenterStore.centers,
    ],
  );
  const projectInitialValues = useMemo(
    () =>
      createProjectInitialValues(
        responsibilityCenterStore.classifications,
        responsibilityCenterStore.types,
      ),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );
  const isReadonly = mode === "view";

  function updateCurrency(nextCurrency: string) {
    form.updateField("currency", nextCurrency);
    form.updateField("fxRate", getVoucherCurrencyExchangeRate(nextCurrency));
  }

  return (
    <>
      <section className="grid min-w-0 gap-5 overflow-visible">
        <ModuleTabs
          activeTab={activeTab}
          ariaLabel="Cash advance sections"
          tabs={CashAdvanceTabs}
          onTabChange={setActiveTab}
        />

        {activeTab === "advance" ? (
          <>
            <form className="grid min-w-0 gap-x-8 gap-y-5 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5 xl:grid-cols-3">
              <CashAdvancePrimaryFields
                accountOptions={accountOptions}
                costCenterOptions={costCenterOptions}
                currencyOptions={currencyOptions}
                form={form}
                isReadonly={isReadonly}
                partyOptions={partyOptions}
                projectOptions={projectOptions}
                onOpenCostCenterDrawer={() => setIsCostCenterDrawerOpen(true)}
                onOpenPartyDialog={() => setIsPartyDialogOpen(true)}
                onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
                onUpdateCurrency={updateCurrency}
              />
            </form>
          </>
        ) : (
          <CashAdvanceFileAttachmentFields
            attachments={form.values.attachments}
            isReadonly={isReadonly}
            onAttachmentsChange={(attachments) => form.updateField("attachments", attachments)}
          />
        )}
      </section>
      <AppPartyDialog
        isOpen={isPartyDialogOpen}
        suggestedPartyType="Employee"
        onClose={() => setIsPartyDialogOpen(false)}
        onSelect={(record) => {
          const partyValue = mapPartyRecordToPartyValue(record);

          form.updateField("partyCode", partyValue.partyCode);
          form.updateField("partyName", partyValue.partyName);
          form.updateReferenceField("partyCode", partyValue.partyCode);
          setIsPartyDialogOpen(false);
        }}
      />
      <ResponsibilityCenterDrawer
        initialValues={costCenterInitialValues}
        isOpen={!isReadonly && isCostCenterDrawerOpen}
        mode="add"
        onClose={() => setIsCostCenterDrawerOpen(false)}
        onSaved={(center) => {
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
          form.updateReferenceField("projectRef", center.name);
          form.updateReferenceField("projectCode", center.code);
          setIsProjectDrawerOpen(false);
        }}
      />
    </>
  );
}

const CashAdvanceTabs = [
  { id: "advance", label: "Cash Advance Details" },
  { id: "attachment", label: "File Attachments" },
] satisfies ModuleTabItem<CashAdvanceDetailsSection>[];

function CashAdvancePrimaryFields({
  accountOptions,
  costCenterOptions,
  currencyOptions,
  form,
  isReadonly,
  onOpenCostCenterDrawer,
  onOpenPartyDialog,
  onOpenProjectDrawer,
  onUpdateCurrency,
  partyOptions,
  projectOptions,
}: {
  accountOptions: AppAdvancedDropdownOption[];
  costCenterOptions: AppAdvancedDropdownOption[];
  currencyOptions: AppAdvancedDropdownOption[];
  form: CashAdvanceFormController;
  isReadonly: boolean;
  onOpenCostCenterDrawer: () => void;
  onOpenPartyDialog: () => void;
  onOpenProjectDrawer: () => void;
  onUpdateCurrency: (value: string) => void;
  partyOptions: AppAdvancedDropdownOption[];
  projectOptions: AppAdvancedDropdownOption[];
}) {
  return (
    <>
      <div className="grid min-w-0 content-start gap-4">
        <FieldShell controlId="cash-advance-party" label="Party Name" isRequired>
          <AppAdvancedDropdown
            id="cash-advance-party"
            addAction={
              !isReadonly
                ? {
                    label: "Add Party Name",
                    onClick: onOpenPartyDialog,
                  }
                : undefined
            }
            options={partyOptions}
            menuMinWidth={320}
            placeholder="Select Party Name"
            readOnly={isReadonly}
            searchPlaceholder="Search Party Name"
            value={form.values.partyCode}
            onChange={(value) => {
              const code = String(value);
              const party = partyOptions.find((option) => option.value === code);

              form.updateField("partyCode", code);
              form.updateField("partyName", party?.name ?? "");
              form.updateReferenceField("partyCode", code);
            }}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-account-code" label="Account Title" isRequired>
          <AppAdvancedDropdown
            id="cash-advance-account-code"
            value={form.values.accountCode}
            readOnly={isReadonly}
            menuMinWidth={300}
            options={accountOptions}
            placeholder="Select Account Title"
            searchPlaceholder="Search account title"
            onChange={(value) => {
              const accountCode = String(value);

              form.updateField("accountCode", accountCode);
              form.updateReferenceField("accountCode", accountCode);
            }}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-cost-center" label="Responsibility Center">
          <AppAdvancedDropdown
            id="cash-advance-cost-center"
            value={form.values.costCenter}
            addAction={
              !isReadonly
                ? {
                    label: "Add Responsibility Center",
                    onClick: onOpenCostCenterDrawer,
                  }
                : undefined
            }
            readOnly={isReadonly}
            menuMinWidth={300}
            options={costCenterOptions}
            placeholder="Select Responsibility Center"
            searchPlaceholder="Search responsibility center"
            onChange={(value) => {
              const costCenter = String(value);
              const option = costCenterOptions.find((currentOption) => currentOption.value === costCenter);

              form.updateField("costCenter", costCenter);
              form.updateReferenceField(
                "costCenterCode",
                option?.label === costCenter ? "" : option?.label ?? "",
              );
            }}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-project-name" label="Project Name">
          <AppAdvancedDropdown
            id="cash-advance-project-name"
            value={form.values.referenceFields.projectRef}
            addAction={
              !isReadonly
                ? {
                    label: "Add Project Name",
                    onClick: onOpenProjectDrawer,
                  }
                : undefined
            }
            readOnly={isReadonly}
            menuMinWidth={320}
            options={projectOptions}
            placeholder="Select Project Name"
            searchPlaceholder="Search project name"
            onChange={(value) => {
              const projectName = String(value);
              const project = projectOptions.find((option) => option.value === projectName);

              form.updateReferenceField("projectRef", projectName);
              form.updateReferenceField(
                "projectCode",
                project?.label === projectName ? "" : project?.label ?? "",
              );
            }}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-currency" label="Currency">
          <CurrencyExchangeRateRow
            exchangeRateControlId="cash-advance-fx-rate"
            currencyControl={
              <AppAdvancedDropdown
                id="cash-advance-currency"
                className="w-full min-w-0"
                value={form.values.currency}
                readOnly={isReadonly}
                isClearable={false}
                menuMinWidth={300}
                options={currencyOptions}
                placeholder="Currency"
                searchPlaceholder="Search currency"
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
                onChange={(event) =>
                  form.updateField(
                    "fxRate",
                    formatExchangeRateInput(event.target.value),
                  )
                }
                className={`${FieldClassName} text-right`}
              />
            }
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-amount" label="Amount" isRequired>
          <MoneyNumberField
            id="cash-advance-amount"
            min="0"
            value={form.values.amount}
            onValueChange={form.updateAmount}
            placeholder="0.00"
            readOnly={isReadonly}
            className={`${FieldClassName} text-right tabular-nums`}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-remarks" label="Remarks">
          <AppLimitedTextarea
            id="cash-advance-remarks"
            value={form.values.remarks}
            onChange={(event) => form.updateField("remarks", event.target.value)}
            readOnly={isReadonly}
            className={`${FieldClassName} min-h-24 py-3`}
            counterMode="used"
          />
        </FieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <FieldShell controlId="cash-advance-party-code" label="Party Code">
          <input
            id="cash-advance-party-code"
            value={form.values.partyCode}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-account-code-reference" label="Account Code">
          <input
            id="cash-advance-account-code-reference"
            value={form.values.accountCode}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-cost-center-code" label="Responsibility Center Code">
          <input
            id="cash-advance-cost-center-code"
            value={form.values.referenceFields.costCenterCode}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-project-code" label="Project Code">
          <input
            id="cash-advance-project-code"
            value={form.values.referenceFields.projectCode}
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <FieldShell controlId="cash-advance-trans-no" label="Cash Advance No." isRequired>
          <input
            id="cash-advance-trans-no"
            value={form.values.transNo}
            placeholder="Auto Generated Cash Advance Transaction Number"
            readOnly
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-document-date" label="Cash Advance Date">
          <input
            id="cash-advance-document-date"
            type="date"
            readOnly={isReadonly}
            value={form.values.documentDate}
            onChange={(event) =>
              form.updateField("documentDate", event.target.value)
            }
            className={FieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-status" label="Status">
          <input
            id="cash-advance-status"
            readOnly
            value={form.values.status}
            className={ReadOnlyFieldClassName}
          />
        </FieldShell>
      </div>
    </>
  );
}

function createCashAdvanceCurrencyDropdownOptions(): AppAdvancedDropdownOption[] {
  return createVoucherCurrencyOptions().map((currency) => ({
    label: currency.isDefault ? `${currency.name} | Default` : currency.name,
    name: currency.code,
    value: currency.code,
  }));
}

function createCashAdvanceSelectDropdownOptions(
  options: readonly { label: string; value: string }[],
): AppAdvancedDropdownOption[] {
  return options
    .filter((option) => option.value)
    .map((option) => ({
      label: option.value,
      name: option.label,
      value: option.value,
    }));
}

function createCashAdvanceCostCenterDropdownOptions({
  centers,
  currentCostCenter,
}: {
  centers: ResponsibilityCenter[];
  currentCostCenter: string;
}): AppAdvancedDropdownOption[] {
  const options = createCashAdvanceSelectDropdownOptions(CashAdvanceCostCenterOptions);

  centers
    .filter((center) => center.status === "Active" && center.financialType === "Cost Center")
    .forEach((center) => {
      addUniqueDropdownOption(options, {
        description: center.category,
        label: center.code,
        name: center.name,
        value: center.name,
      });
    });

  if (currentCostCenter.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current cash advance value",
      label: currentCostCenter,
      name: currentCostCenter,
      value: currentCostCenter,
    });
  }

  return options;
}

function createCostCenterInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const costCenterClassification = classifications.find(
    (classification) => classification.name === "Cost Center",
  );
  const costCenterType = types.find(
    (type) =>
      type.classificationId === costCenterClassification?.id &&
      type.classificationName === "Cost Center",
  );

  return {
    ...ResponsibilityCenterInitialFormValues,
    classificationId: costCenterClassification?.id ?? "",
    financialType: "Cost Center",
    typeId: costCenterType?.id ?? "",
  };
}

function createCashAdvanceProjectDropdownOptions({
  centers,
  currentProjectCode,
  currentProjectName,
}: {
  centers: ResponsibilityCenter[];
  currentProjectCode: string;
  currentProjectName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherProjectOptions];

  centers
    .filter((center) => center.status === "Active" && center.category === "Project")
    .forEach((center) => {
      addUniqueDropdownOption(options, {
        description: center.financialType,
        label: center.code,
        name: center.name,
        value: center.name,
      });
    });

  if (currentProjectName.trim() || currentProjectCode.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current cash advance value",
      label: currentProjectCode || currentProjectName,
      name: currentProjectName || currentProjectCode,
      value: currentProjectName || currentProjectCode,
    });
  }

  return options;
}

function createProjectInitialValues(
  classifications: ResponsibilityCenterClassification[],
  types: ResponsibilityCenterTypeOption[],
): ResponsibilityCenterFormValues {
  const projectType = types.find((type) => type.name === "Project");
  const projectClassification = classifications.find(
    (classification) => classification.id === projectType?.classificationId,
  );
  const costCenterClassification = classifications.find(
    (classification) => classification.name === "Cost Center",
  );
  const classification = projectClassification ?? costCenterClassification;

  return {
    ...ResponsibilityCenterInitialFormValues,
    category: "Project",
    classificationId: classification?.id ?? "",
    financialType: classification?.name ?? "Cost Center",
    typeId: projectType?.id ?? "",
  };
}

function createCashAdvancePartyOptions({
  currentPartyCode,
  currentPartyName,
}: {
  currentPartyCode: string;
  currentPartyName: string;
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = [...DisbursementVoucherPartyOptions];

  if (currentPartyCode.trim() || currentPartyName.trim()) {
    addUniqueDropdownOption(options, {
      description: "Current cash advance value",
      label: currentPartyCode || "Current party",
      name: currentPartyName || currentPartyCode,
      value: currentPartyCode || currentPartyName,
    });
  }

  return options;
}

function FieldShell({
  children,
  controlId,
  isRequired = false,
  label,
}: {
  children: ReactNode;
  controlId?: string;
  isRequired?: boolean;
  label: string;
}) {
  const labelContent = (
    <>
      {label}
      {isRequired ? <span className="ml-1 text-coralpink">*</span> : null}
    </>
  );

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start">
      {controlId ? (
        <label htmlFor={controlId} className="pt-2 text-sm font-semibold text-darknavy">
          {labelContent}
        </label>
      ) : (
        <span className="pt-2 text-sm font-semibold text-darknavy">{labelContent}</span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const FieldClassName =
  "app-data-entry-field h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/45 focus:bg-white focus:ring-4 focus:ring-skyblue/15 read-only:bg-white read-only:text-darknavy disabled:bg-white disabled:text-darknavy";

const ReadOnlyFieldClassName =
  "app-data-entry-field transaction-readonly-placeholder h-11 min-w-0 w-full rounded-lg border border-darknavy/10 bg-darknavy/5 px-3 text-sm font-medium text-darknavy/60 outline-none placeholder:text-darknavy/35";

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}
