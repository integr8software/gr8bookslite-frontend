"use client";

import {
  BankMasterfileActionCopy,
  BankMasterfileDrawerFormId,
  BankMasterfileTitle,
} from "@/app/src/constants/modules/financial-maintenance/bank-masterfile/BankMasterfileConstants";
import {
  DefaultPreferredBaseCurrencyCode,
  findCurrencyByCode,
} from "@/app/src/data/modules/system-administration/multi-currency-setup/MultiCurrencySetupData";
import { useBankMasterfileFormPage } from "@/app/src/hooks/modules/financial-maintenance/bank-masterfile/useBankMasterfileFormPage";
import { useMultiCurrencySetupStore } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetup";
import type {
  BankMasterfile,
  BankMasterfileDrawerProps,
} from "@/app/src/types/modules/financial-maintenance/bank-masterfile/BankMasterfileTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { BankMasterfileFields } from "@/app/src/ui/modules/financial-maintenance/bank-masterfile/BankMasterfileFields";

export function BankMasterfileDrawer({ bank, isOpen, mode, onClose }: BankMasterfileDrawerProps) {
  return <BankMasterfileDrawerPanel key={`${mode}-${bank?.id ?? "new"}`} bank={bank} isOpen={isOpen} mode={mode} onClose={onClose} />;
}

function BankMasterfileDrawerPanel({
  bank,
  isOpen,
  mode,
  onClose,
}: {
  bank?: BankMasterfile;
  isOpen: boolean;
  mode: BankMasterfileDrawerProps["mode"];
  onClose: () => void;
}) {
  const page = useBankMasterfileFormPage({
    existingBank: bank,
    mode,
    onSaved: onClose,
  });
  const currencySetupRecords = useMultiCurrencySetupStore((state) => state.records);
  const copy = BankMasterfileActionCopy[mode];
  const accountCode = mode === "add" ? page.nextAccountCode : (bank?.accountCode ?? "");
  const currencyOptions = createBankCurrencyOptions(currencySetupRecords);

  return (
    <ModuleDrawer
      description={copy.description}
      eyebrow={BankMasterfileTitle}
      formId={BankMasterfileDrawerFormId}
      isOpen={isOpen}
      isReadonly={page.isReadonly}
      isSaving={page.isSubmitting}
      maxWidthClassName="max-w-4xl"
      onBeforeSaveConfirm={page.validateBeforeSubmit}
      onClose={onClose}
      savingLabel={getModuleSavePendingLabel(mode)}
      submitLabel={mode === "edit" ? "Update Bank" : "Save Bank"}
      title={copy.title}
    >
      <form id={BankMasterfileDrawerFormId} onSubmit={page.handleSubmit} className="px-6 py-5">
        <BankMasterfileFields
          accountCode={accountCode}
          currencyOptions={currencyOptions}
          errors={page.errors}
          isAccountCodeLoading={page.isNextAccountCodeLoading}
          isReadonly={page.isReadonly}
          mode={mode}
          values={page.values}
          onCurrencyChange={(value) => page.handleFieldChange("currencyCode", value)}
          onDefaultChange={(value) => page.handleFieldChange("isDefault", value)}
          onInputChange={page.handleInputChange}
          onStatusChange={(value) => page.handleFieldChange("status", value)}
        />
      </form>
    </ModuleDrawer>
  );
}

function createBankCurrencyOptions(
  records: Array<{
    baseCurrencyCode: string;
    status: string;
    targetCurrencyCode: string;
  }>,
) {
  const currencyCodes = new Set<string>([DefaultPreferredBaseCurrencyCode]);

  records
    .filter((record) => record.status === "Active")
    .forEach((record) => {
      currencyCodes.add(record.baseCurrencyCode);
      currencyCodes.add(record.targetCurrencyCode);
    });

  return [...currencyCodes].sort().map((code) => {
    const currency = findCurrencyByCode(code);

    return {
      code,
      country: currency?.country ?? "",
      name: currency?.name ?? code,
    };
  });
}
