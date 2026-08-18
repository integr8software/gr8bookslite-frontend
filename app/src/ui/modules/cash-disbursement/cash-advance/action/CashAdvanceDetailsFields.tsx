"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  DisbursementVoucherPartyOptions,
  DisbursementVoucherProjectOptions,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceCostCenterOptions,
  CashAdvanceFieldClassName,
  CashAdvanceReadOnlyFieldClassName,
  CashAdvanceTabs,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { ResponsibilityCenterInitialFormValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useCashAdvanceEmployeeOptions } from "@/app/src/hooks/modules/party-management/useCashAdvanceEmployeeOptions";
import type {
  CashAdvanceActionMode,
  CashAdvanceDetailsSection,
  CashAdvanceEmployeeOption,
  CashAdvanceFormController,
  CashAdvancePartyDropdownOption,
} from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
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
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { formatMoneyNumberDisplayValue, MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";
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
  const { employeeOptions, isEmployeeOptionsError } = useCashAdvanceEmployeeOptions("cash-advance");
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
    () => createCostCenterInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );
  const partyOptions = useMemo(
    () =>
      createCashAdvancePartyOptions({
        employeeOptions,
        currentPartyCode: form.values.partyCode,
        currentPartyName: form.values.partyName,
      }),
    [employeeOptions, form.values.partyCode, form.values.partyName],
  );
  const projectOptions = useMemo(
    () =>
      createCashAdvanceProjectDropdownOptions({
        centers: responsibilityCenterStore.centers,
        currentProjectCode: form.values.referenceFields.projectCode,
        currentProjectName: form.values.referenceFields.projectRef,
      }),
    [form.values.referenceFields.projectCode, form.values.referenceFields.projectRef, responsibilityCenterStore.centers],
  );
  const projectInitialValues = useMemo(
    () => createProjectInitialValues(responsibilityCenterStore.classifications, responsibilityCenterStore.types),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
  );
  const isReadonly = mode === "view";

  return (
    <>
      <section className="grid min-w-0 gap-5 overflow-visible">
        <ModuleTabs activeTab={activeTab} ariaLabel="Cash advance sections" tabs={CashAdvanceTabs} onTabChange={setActiveTab} />

        {isEmployeeOptionsError ? (
          <p role="alert" className="rounded-lg border border-coralpink/30 bg-coralpink/5 px-4 py-3 text-sm text-darknavy">
            Employee lookup options could not be loaded. You can retry by refreshing the page.
          </p>
        ) : null}

        {activeTab === "advance" ? (
          <>
            <form className="grid min-w-0 gap-x-8 gap-y-5 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5 xl:grid-cols-3">
              <CashAdvancePrimaryFields
                accountOptions={accountOptions}
                costCenterOptions={costCenterOptions}
                currencyOptions={form.currencyOptions}
                form={form}
                isReadonly={isReadonly}
                partyOptions={partyOptions}
                projectOptions={projectOptions}
                onOpenCostCenterDrawer={() => setIsCostCenterDrawerOpen(true)}
                onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
                onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
                onUpdateCurrency={form.updateCurrency}
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

            form.updateField("partyCode", record.partyCodeNo);
            form.updateField("partyName", partyName);
            form.updateField("cashAdvanceBalance", record.cashAdvanceLimit ?? "");
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
}: {
  accountOptions: AppAdvancedDropdownOption[];
  costCenterOptions: AppAdvancedDropdownOption[];
  currencyOptions: AppAdvancedDropdownOption[];
  form: CashAdvanceFormController;
  isReadonly: boolean;
  onOpenCostCenterDrawer: () => void;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onUpdateCurrency: (value: string) => void;
  partyOptions: CashAdvancePartyDropdownOption[];
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
                    onClick: onOpenPartyDrawer,
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
              form.updateField("cashAdvanceBalance", party?.cashAdvanceBalance ?? "");
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
              form.updateReferenceField("costCenterCode", option?.label === costCenter ? "" : (option?.label ?? ""));
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
              form.updateReferenceField("projectCode", project?.label === projectName ? "" : (project?.label ?? ""));
            }}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-remarks" label="Remarks">
          <AppLimitedTextarea
            id="cash-advance-remarks"
            value={form.values.remarks}
            onChange={(event) => form.updateField("remarks", event.target.value)}
            readOnly={isReadonly}
            className={`${CashAdvanceFieldClassName} min-h-24 py-3`}
            counterMode="used"
          />
        </FieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4">
        <FieldShell controlId="cash-advance-party-code" label="Party Code">
          <input id="cash-advance-party-code" value={form.values.partyCode} readOnly className={CashAdvanceReadOnlyFieldClassName} />
        </FieldShell>
        <FieldShell controlId="cash-advance-account-code-reference" label="Account Code">
          <input
            id="cash-advance-account-code-reference"
            value={form.values.accountCode}
            readOnly
            className={CashAdvanceReadOnlyFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-cost-center-code" label="Responsibility Center Code">
          <input
            id="cash-advance-cost-center-code"
            value={form.values.referenceFields.costCenterCode}
            readOnly
            className={CashAdvanceReadOnlyFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-project-code" label="Project Code">
          <input
            id="cash-advance-project-code"
            value={form.values.referenceFields.projectCode}
            readOnly
            className={CashAdvanceReadOnlyFieldClassName}
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
                menuMinWidth={320}
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
                disabled={isReadonly || form.isExchangeRateLoading}
                onChange={(event) => form.updateField("fxRate", formatExchangeRateInput(event.target.value))}
                className={`${CashAdvanceFieldClassName} text-right`}
              />
            }
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-balance" label="Cash Advance Balance">
          <MoneyNumberField
            id="cash-advance-balance"
            value={form.values.cashAdvanceBalance}
            onValueChange={() => undefined}
            readOnly
            className={`${CashAdvanceReadOnlyFieldClassName} text-right tabular-nums`}
            placeholder="0.00"
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
            className={`${CashAdvanceFieldClassName} text-right tabular-nums`}
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
            className={CashAdvanceReadOnlyFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-document-date" label="Cash Advance Date">
          <input
            id="cash-advance-document-date"
            type="date"
            readOnly={isReadonly}
            value={form.values.documentDate}
            onChange={(event) => form.updateField("documentDate", event.target.value)}
            className={CashAdvanceFieldClassName}
          />
        </FieldShell>
        <FieldShell controlId="cash-advance-status" label="Status">
          <input id="cash-advance-status" readOnly value={form.values.status} className={CashAdvanceReadOnlyFieldClassName} />
        </FieldShell>
      </div>
    </>
  );
}

function createCashAdvanceSelectDropdownOptions(options: readonly { label: string; value: string }[]): AppAdvancedDropdownOption[] {
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
  const costCenterClassification = classifications.find((classification) => classification.name === "Cost Center");
  const costCenterType = types.find(
    (type) => type.classificationId === costCenterClassification?.id && type.classificationName === "Cost Center",
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
  const projectClassification = classifications.find((classification) => classification.id === projectType?.classificationId);
  const costCenterClassification = classifications.find((classification) => classification.name === "Cost Center");
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
  employeeOptions,
  currentPartyCode,
  currentPartyName,
}: {
  employeeOptions: CashAdvanceEmployeeOption[];
  currentPartyCode: string;
  currentPartyName: string;
}): CashAdvancePartyDropdownOption[] {
  const options: CashAdvancePartyDropdownOption[] = employeeOptions.map((employee) => ({
    cashAdvanceBalance: employee.cashAdvanceBalance,
    description: employee.cashAdvanceLimit
      ? `Cash advance limit: ${formatMoneyNumberDisplayValue(employee.cashAdvanceLimit)}`
      : "No cash advance limit",
    label: employee.partyCode,
    name: employee.partyName,
    value: employee.partyCode,
  }));

  if (options.length === 0) {
    DisbursementVoucherPartyOptions.forEach((option) => addUniqueDropdownOption(options, option));
  }

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

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}
