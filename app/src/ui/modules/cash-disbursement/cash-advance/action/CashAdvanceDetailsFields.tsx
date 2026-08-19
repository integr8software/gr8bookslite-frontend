"use client";

import { useMemo, useState } from "react";
import {
  DisbursementVoucherPartyOptions,
  DisbursementVoucherProjectOptions,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import {
  CashAdvanceAccountOptions,
  CashAdvanceCostCenterOptions,
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
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import {
  TransactionField,
  TransactionFieldClassName,
  TransactionTextField,
} from "@/app/src/ui/shared/transaction-setup/TransactionFormFields";
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
          <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
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
    <div className="grid gap-5 xl:grid-cols-3">
      {/* Column 1: Name & Lookup Fields */}
      <div className="grid min-w-0 content-start gap-5">
        <TransactionField label="Party Name" isRequired>
          <AppLookupDropdown
            value={form.values.partyCode}
            options={partyOptions}
            readOnly={isReadonly}
            placeholder="Select Party Name"
            searchPlaceholder="Search Party Name"
            addAction={!isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
            onChange={(code, name) => {
              const party = partyOptions.find((option) => option.value === code);

              form.updateField("partyCode", code);
              form.updateField("partyName", name);
              form.updateField("cashAdvanceBalance", party?.cashAdvanceBalance ?? "");
              form.updateReferenceField("partyCode", code);
            }}
          />
        </TransactionField>

        <TransactionField label="Account Title" isRequired>
          <AppLookupDropdown
            value={form.values.accountCode}
            options={accountOptions}
            readOnly={isReadonly}
            placeholder="Select Account Title"
            searchPlaceholder="Search Account Title"
            onChange={(code) => {
              form.updateField("accountCode", code);
              form.updateReferenceField("accountCode", code);
            }}
          />
        </TransactionField>

        <TransactionField label="Responsibility Center">
          <AppLookupDropdown
            value={form.values.costCenter}
            options={costCenterOptions}
            readOnly={isReadonly}
            placeholder="Select Responsibility Center"
            searchPlaceholder="Search Responsibility Center"
            addAction={!isReadonly ? { label: "Add Responsibility Center", onClick: onOpenCostCenterDrawer } : undefined}
            onChange={(costCenter) => {
              const option = costCenterOptions.find((currentOption) => currentOption.value === costCenter);

              form.updateField("costCenter", costCenter);
              form.updateReferenceField("costCenterCode", option?.label === costCenter ? "" : (option?.label ?? ""));
            }}
          />
        </TransactionField>

        <TransactionField label="Project Name">
          <AppLookupDropdown
            value={form.values.referenceFields.projectRef}
            options={projectOptions}
            readOnly={isReadonly}
            placeholder="Select Project Name"
            searchPlaceholder="Search Project Name"
            addAction={!isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined}
            onChange={(projectName) => {
              const project = projectOptions.find((option) => option.value === projectName);

              form.updateReferenceField("projectRef", projectName);
              form.updateReferenceField("projectCode", project?.label === projectName ? "" : (project?.label ?? ""));
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
          onValueChange={(value) => form.updateField("partyCode", value)}
          placeholder="Party Code"
        />

        <TransactionTextField
          value={form.values.accountCode}
          isReadonly
          isRequired
          label="Account Code"
          onValueChange={(value) => form.updateField("accountCode", value)}
          placeholder="Account Code"
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
          currencyControlId="cash-advance-currency"
          currencyLabel="Currency"
          currencyControl={
            <AppAdvancedDropdown
              id="cash-advance-currency"
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
          exchangeRateControlId="cash-advance-fx-rate"
          exchangeRateControl={
            <input
              id="cash-advance-fx-rate"
              type="text"
              inputMode="decimal"
              value={form.values.fxRate}
              readOnly={isReadonly}
              disabled={isReadonly || form.isExchangeRateLoading}
              onChange={(event) => form.updateField("fxRate", formatExchangeRateInput(event.target.value))}
              className={`${TransactionFieldClassName} text-right tabular-nums`}
            />
          }
        />

        <TransactionField label="Cash Advance Balance">
          <MoneyNumberField
            value={form.values.cashAdvanceBalance}
            onValueChange={() => undefined}
            readOnly
            className={`${TransactionFieldClassName} text-right tabular-nums`}
            placeholder="0.00"
          />
        </TransactionField>

        <TransactionField label="Amount" isRequired>
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
          label="Cash Advance No."
          onValueChange={(value) => form.updateField("transNo", value)}
          placeholder="Auto Generated Cash Advance Transaction Number"
        />

        <TransactionTextField
          value={form.values.documentDate}
          isReadonly={isReadonly}
          isRequired
          label="Cash Advance Date"
          type="date"
          onValueChange={(value) => form.updateField("documentDate", value)}
        />

        <TransactionTextField value={form.values.status} isReadonly label="Status" onValueChange={() => undefined} />
      </div>
    </div>
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

function addUniqueDropdownOption(options: AppAdvancedDropdownOption[], option: AppAdvancedDropdownOption) {
  if (!option.value.trim()) {
    return;
  }

  if (options.some((currentOption) => currentOption.value === option.value)) {
    return;
  }

  options.push(option);
}
