"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { ResponsibilityCenterInitialFormValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { getDefaultPartyPurchaseType } from "@/app/src/data/modules/party-management/PartyPurchaseTypeData";
import { createProjectCodeLookupOptions } from "@/app/src/data/modules/project-maintenance/ProjectMaintenanceLookupData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { useProjectMaintenanceLookup } from "@/app/src/hooks/modules/project-maintenance/useProjectMaintenance";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyAddress, PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { ProjectMaintenance } from "@/app/src/types/modules/project-maintenance/ProjectMaintenanceTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { usePurchaseRequestFormPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestFormPage";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ProjectMaintenanceDrawer } from "@/app/src/ui/modules/project-maintenance/ProjectMaintenanceDrawer";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/dialogs/PartyManagementDrawer";
import { PurchaseRequestDetailsForm } from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestFieldContent";
import { PurchaseRequestFormHeader } from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestPageHeader";
import { PurchaseRequestEntrySection } from "@/app/src/ui/modules/purchasing/purchase-request/entries/PurchaseRequestEntrySection";
import { PurchaseRequestPreviewDrawer } from "@/app/src/ui/modules/purchasing/purchase-request/reports/PurchaseRequestPreviewDrawer";

export function PurchaseRequestActionPage() {
  return (
    <Suspense fallback={<PurchaseRequestFormSkeleton />}>
      <PurchaseRequestActionPageInner />
    </Suspense>
  );
}

function PurchaseRequestActionPageInner() {
  const page = usePurchaseRequestFormPage();
  const partyStore = usePartyManagementStore();
  const responsibilityCenterStore = useResponsibilityCenterStore();
  const projectOptionsQuery = useProjectMaintenanceLookup();
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isResponsibilityCenterDrawerOpen, setIsResponsibilityCenterDrawerOpen] = useState(false);
  const partyOptions = useMemo(() => createPartyOptions(partyStore.records), [partyStore.records]);
  const projectOptions = useMemo(
    () =>
      createProjectCodeLookupOptions({
        currentProjectCode: page.values.projectCode,
        currentProjectName: page.values.projectName,
        options: projectOptionsQuery.data ?? [],
      }),
    [page.values.projectCode, page.values.projectName, projectOptionsQuery.data],
  );
  const responsibilityCenterOptions = useMemo(
    () =>
      createHeaderResponsibilityCenterOptions({
        currentCenterId: page.values.responsibilityCenterId,
        currentCenterName: page.values.responsibilityCenter || page.values.forDepartment,
        records: responsibilityCenterStore.centers,
      }),
    [page.values.responsibilityCenterId, page.values.responsibilityCenter, page.values.forDepartment, responsibilityCenterStore.centers],
  );
  const responsibilityCenterInitialValues = useMemo(
    () => ResponsibilityCenterInitialFormValues,
    [],
  );

  if (page.needsRecord && !page.existingRequest) {
    return <PurchaseRequestNotFound />;
  }

  function updateSelectedParty(partyCode: string, partyName: string) {
    const selectedParty = partyStore.records.find((record) => record.partyCodeNo === partyCode);

    page.updateField("vceCode", partyCode);
    page.updateField("vceName", partyName);

    if (selectedParty) {
      page.updateField("vendorAddress", formatPartyAddress(getPurchaseRequestPartyAddress(selectedParty)));
      page.updateField("purchaseType", getDefaultPartyPurchaseType(selectedParty.purchaseType));
    } else {
      page.updateField("vendorAddress", "");
      page.updateField("purchaseType", "");
    }
  }

  function updateSelectedProject(projectCode: string, projectName: string) {
    page.updateField("projectCode", projectCode);
    page.updateField("projectName", projectName);
  }

  function updateCreatedProject(project: ProjectMaintenance) {
    page.updateField("projectCode", project.projectCode || project.projectName);
    page.updateField("projectName", project.projectName);
    setIsProjectDrawerOpen(false);
  }

  function updateCreatedResponsibilityCenter(center: ResponsibilityCenter) {
    page.updateResponsibilityCenter(center.id, center.name);
    setIsResponsibilityCenterDrawerOpen(false);
  }

  return (
    <section className="purchase-request-form-page grid gap-5">
      <PurchaseRequestFormHeader
        existingRequestId={page.existingRequest?.id}
        isSubmitting={page.isSubmitting}
        mode={page.mode}
        values={page.values}
        onCopyFromSource={page.copyFromSourceTransactions}
        onPreview={() => page.setShowPreview(true)}
        onSubmit={page.handleSubmit}
      />

      <div className="grid min-w-0 gap-5">
        <PurchaseRequestDetailsForm
          isReadonly={page.isReadonly}
          partyOptions={partyOptions}
          projectOptions={projectOptions}
          responsibilityCenterOptions={responsibilityCenterOptions}
          values={page.values}
          onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
          onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
          onOpenResponsibilityCenterDrawer={() => setIsResponsibilityCenterDrawerOpen(true)}
          onSelectParty={updateSelectedParty}
          onSelectProject={updateSelectedProject}
          onSelectResponsibilityCenter={page.updateResponsibilityCenter}
          onUpdateField={page.updateField}
        />
        <PurchaseRequestEntrySection
          accountingRows={page.values.accountingEntries}
          defaultResponsibilityCenter={{
            id: page.values.responsibilityCenterId,
            name: page.values.responsibilityCenter,
          }}
          error={page.errors.items}
          itemDescriptionOptions={page.itemDescriptionOptions}
          isReadonly={page.isReadonly}
          purchaseType={page.values.purchaseType}
          responsibilityCenters={responsibilityCenterStore.centers}
          rows={page.values.items}
          serviceDescriptionOptions={page.serviceDescriptionOptions}
          onAccountingRowsChange={page.updateAccountingEntries}
          onRowsChange={page.updateItems}
        />
      </div>

      <PurchaseRequestPreviewDrawer isOpen={page.showPreview} record={page.previewRecord} onClose={() => page.setShowPreview(false)} />
      <PartyManagementDrawer
        isOpen={!page.isReadonly && isPartyDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        suggestedPartyType="Vendor"
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={(record) => {
          page.updateField("vceCode", record.partyCodeNo);
          page.updateField("vceName", getPartyDisplayName(record));
          page.updateField("vendorAddress", formatPartyAddress(getPurchaseRequestPartyAddress(record)));
          page.updateField("purchaseType", getDefaultPartyPurchaseType(record.purchaseType));
          setIsPartyDrawerOpen(false);
        }}
      />
      <ProjectMaintenanceDrawer
        isOpen={!page.isReadonly && isProjectDrawerOpen}
        mode="add"
        onClose={() => setIsProjectDrawerOpen(false)}
        onSaved={updateCreatedProject}
      />
      <ResponsibilityCenterDrawer
        initialValues={responsibilityCenterInitialValues}
        isOpen={!page.isReadonly && isResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={() => setIsResponsibilityCenterDrawerOpen(false)}
        onSaved={updateCreatedResponsibilityCenter}
      />
    </section>
  );
}

function PurchaseRequestNotFound() {
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Purchase Request Not Found"
        description="The selected purchase request could not be found."
        actions={
          <Link href={PurchaseRequestHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to List
          </Link>
        }
      />
    </section>
  );
}

function PurchaseRequestFormSkeleton() {
  return (
    <section className="grid gap-5">
      <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
        <div className="h-64 animate-pulse rounded-lg bg-white shadow-sm" />
      </div>
    </section>
  );
}

function createPartyOptions(records: PartyInformationRecord[]): AppAdvancedDropdownOption[] {
  return records
    .filter((record) => record.status === "Active" && record.partyCodeNo.trim())
    .map((record) => ({
      description: record.partyTypes.join(", "),
      label: record.partyCodeNo,
      name: getPartyDisplayName(record),
      selectedDetails: record.partyCodeNo,
      value: record.partyCodeNo,
    }));
}

function getPurchaseRequestPartyAddress(record: PartyInformationRecord) {
  return (
    record.addresses.find((address) => address.isDelivery) ??
    record.addresses.find((address) => address.isBilling) ??
    record.addresses.find((address) => address.isDefault) ??
    record.address
  );
}

function formatPartyAddress(address?: PartyAddress | null) {
  if (!address) {
    return "";
  }

  return [address.addressLine1, address.addressLine2, address.barangay, address.cityMunicipality, address.province, address.region]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function createHeaderResponsibilityCenterOptions({
  currentCenterId,
  currentCenterName,
  records,
}: {
  currentCenterId?: string;
  currentCenterName?: string;
  records: ResponsibilityCenter[];
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = records
    .filter((record) => record.status === "Active" && record.code.trim())
    .map((record) => ({
      description: `${record.category} · ${record.financialType}`,
      label: record.code,
      name: record.name,
      selectedDetails: record.code,
      value: record.id,
    }));

  if (currentCenterId && !options.some((option) => option.value === currentCenterId)) {
    options.unshift({
      description: "Current Responsibility Center",
      label: currentCenterName || currentCenterId,
      name: currentCenterName || currentCenterId,
      selectedDetails: currentCenterId,
      value: currentCenterId,
    });
  } else if (!currentCenterId && currentCenterName?.trim()) {
    const matched = options.find(
      (option) => option.name.trim().toLowerCase() === currentCenterName.trim().toLowerCase(),
    );
    if (!matched) {
      options.unshift({
        description: "Current Responsibility Center",
        label: currentCenterName,
        name: currentCenterName,
        selectedDetails: currentCenterName,
        value: currentCenterName,
      });
    }
  }

  return options;
}
