"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  ServicesMaintenanceActionCopy,
  ServicesMaintenanceDrawerFormId,
  ServicesMaintenanceTitle,
} from "@/app/src/constants/modules/financial-maintenance/services-maintenance/ServicesMaintenanceConstants";
import { useServicesMaintenanceFormPage } from "@/app/src/hooks/modules/financial-maintenance/services-maintenance/useServicesMaintenanceFormPage";
import type { ChartAccount } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import type {
  ServicesMaintenance,
  ServicesMaintenanceDrawerProps,
} from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import { ChartAccountQuickAddDialog } from "@/app/src/ui/modules/financial-maintenance/charts-of-accounts/ChartAccountQuickAddDialog";
import { ServicesMaintenanceAccountingSetupTab } from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceAccountingSetupTab";
import {
  FormField,
  ServicesMaintenanceFields,
} from "@/app/src/ui/modules/financial-maintenance/services-maintenance/ServicesMaintenanceFields";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { ModuleDrawer, getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/utils/status.util";

export function ServicesMaintenanceDrawer({ isOpen, mode, onClose, service }: ServicesMaintenanceDrawerProps) {
  return (
    <ServicesMaintenanceDrawerPanel
      key={`${mode}-${service?.id ?? "new"}`}
      isOpen={isOpen}
      mode={mode}
      onClose={onClose}
      service={service}
    />
  );
}

function ServicesMaintenanceDrawerPanel({
  isOpen,
  mode,
  onClose,
  service,
}: {
  isOpen: boolean;
  mode: ServicesMaintenanceDrawerProps["mode"];
  onClose: () => void;
  service?: ServicesMaintenance;
}) {
  const [isAccountTitleDialogOpen, setIsAccountTitleDialogOpen] = useState(false);
  const page = useServicesMaintenanceFormPage({
    existingService: service,
    mode,
    onSaved: onClose,
  });
  const copy = ServicesMaintenanceActionCopy[mode];
  const serviceRevenueParentAccount = createServiceRevenueParentAccount(page.nextAccountCode);

  function openAccountTitleDialog() {
    if (!serviceRevenueParentAccount) {
      toast.error("Could not find the Service Revenues parent account.");
      return;
    }

    setIsAccountTitleDialogOpen(true);
  }

  return (
    <>
      <ModuleDrawer
        description={copy.description}
        eyebrow={ServicesMaintenanceTitle}
        formId={ServicesMaintenanceDrawerFormId}
        isOpen={isOpen}
        isReadonly={page.isReadonly}
        isSaving={page.isSubmitting}
        onBeforeSaveConfirm={page.validateBeforeSubmit}
        onClose={onClose}
        savingLabel={getModuleSavePendingLabel(mode)}
        submitLabel={mode === "edit" ? "Update Service" : "Save Service"}
        title={copy.title}
      >
        <form id={ServicesMaintenanceDrawerFormId} onSubmit={page.handleSubmit} className="grid gap-5 px-6 py-5">
          <ServicesMaintenanceFields
            errors={page.errors}
            isReadonly={page.isReadonly}
            values={page.values}
            onInputChange={page.handleInputChange}
          />

          <hr className="border-darknavy/10" />

          <ServicesMaintenanceAccountingSetupTab
            accountOptions={page.accountOptions}
            errors={page.errors}
            isAccountCodeLoading={page.isNextAccountCodeLoading}
            isReadonly={page.isReadonly}
            mode={mode}
            nextAccountCode={page.nextAccountCode}
            selectedService={service}
            values={page.values}
            onAccountSetupModeChange={page.setAccountSetupMode}
            onAddAccountTitle={openAccountTitleDialog}
            onRevenueAccountChange={page.setRevenueAccount}
          />

          <hr className="border-darknavy/10" />

          <div className="grid gap-4 lg:grid-cols-2">
            <FormField label="Status" error={page.errors.status} required>
              <AppSwitch
                falseOption={MaintenanceInactiveStatusSwitchOption}
                value={page.values.status}
                onChange={page.setStatus}
                readOnly={page.isReadonly}
                trueOption={MaintenanceActiveStatusSwitchOption}
              />
            </FormField>
          </div>
        </form>
      </ModuleDrawer>
      <ChartAccountQuickAddDialog
        accountGroup={["Revenue", "Service Revenues"]}
        accountLabel="Account"
        isOpen={isAccountTitleDialogOpen}
        parentAccount={serviceRevenueParentAccount}
        onClose={() => setIsAccountTitleDialogOpen(false)}
        onSaved={(accountId) => {
          page.setRevenueAccount(accountId);
          page.refreshSetup();
          setIsAccountTitleDialogOpen(false);
        }}
      />
    </>
  );
}

function createServiceRevenueParentAccount(
  nextAccountCode: ReturnType<typeof useServicesMaintenanceFormPage>["nextAccountCode"],
): ChartAccount | null {
  if (!nextAccountCode?.parentAccountId) {
    return null;
  }

  return {
    id: nextAccountCode.parentAccountId,
    accountNumber: nextAccountCode.parentAccountCode,
    accountName: nextAccountCode.parentAccountTitle,
    accountLevel: nextAccountCode.parentAccountLevel,
    accountGroup: ["Revenue", "Service Revenues", "Services Maintenance Revenue Parent"],
    parentId: null,
    accountType: "REVENUE",
    statementGroup: "Income Statement",
    statementSection: "Revenue",
    reportAlias: "",
    normalBalance: "CREDIT",
    description: nextAccountCode.parentAccountTitle,
    status: "Active",
    showInReports: true,
    isPostingAccount: false,
    isSystemDefault: true,
    isUserCreated: false,
    isBankLinked: false,
    createdBy: null,
    createdAt: "",
    updatedBy: null,
    updatedAt: "",
  };
}
