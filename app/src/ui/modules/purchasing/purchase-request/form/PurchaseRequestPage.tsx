"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { createProjectResponsibilityCenterInitialValues } from "@/app/src/data/modules/financial-maintenance/responsibility-center/ResponsibilityCenterData";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/financial-maintenance/responsibility-center/useResponsibilityCenter";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { ResponsibilityCenter } from "@/app/src/types/modules/financial-maintenance/responsibility-center/ResponsibilityCenterTypes";
import type { PartyAddress, PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { usePurchaseRequestFormPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestFormPage";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
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
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const partyOptions = useMemo(() => createPartyOptions(partyStore.records), [partyStore.records]);
  const projectOptions = useMemo(
    () =>
      createProjectOptions({
        currentProjectCode: page.values.projectCode,
        currentProjectName: page.values.projectName,
        records: responsibilityCenterStore.centers,
      }),
    [page.values.projectCode, page.values.projectName, responsibilityCenterStore.centers],
  );
  const projectInitialValues = useMemo(
    () =>
      createProjectResponsibilityCenterInitialValues(
        responsibilityCenterStore.classifications,
        responsibilityCenterStore.types,
      ),
    [responsibilityCenterStore.classifications, responsibilityCenterStore.types],
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
    }
  }

  function updateSelectedProject(projectCode: string, projectName: string) {
    page.updateField("projectCode", projectCode);
    page.updateField("projectName", projectName);
  }

  function updateCreatedProject(project: ResponsibilityCenter) {
    page.updateField("projectCode", project.code);
    page.updateField("projectName", project.name);
    setIsProjectDrawerOpen(false);
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
          values={page.values}
          onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
          onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
          onSelectParty={updateSelectedParty}
          onSelectProject={updateSelectedProject}
          onUpdateField={page.updateField}
        />
        <PurchaseRequestEntrySection
          accountingRows={page.values.accountingEntries}
          error={page.errors.items}
          itemDescriptionOptions={page.itemDescriptionOptions}
          isReadonly={page.isReadonly}
          purchaseType={page.values.purchaseType}
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
          setIsPartyDrawerOpen(false);
        }}
      />
      <ResponsibilityCenterDrawer
        initialValues={projectInitialValues}
        isOpen={!page.isReadonly && isProjectDrawerOpen}
        mode="add"
        onClose={() => setIsProjectDrawerOpen(false)}
        onSaved={updateCreatedProject}
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

function createProjectOptions({
  currentProjectCode,
  currentProjectName,
  records,
}: {
  currentProjectCode: string;
  currentProjectName: string;
  records: ResponsibilityCenter[];
}): AppAdvancedDropdownOption[] {
  const options: AppAdvancedDropdownOption[] = records
    .filter((record) => record.status === "Active" && record.category === "Project" && record.code.trim())
    .map((record) => ({
      description: record.financialType,
      label: record.code,
      name: record.name,
      selectedDetails: record.code,
      value: record.code,
    }));

  if (
    currentProjectCode.trim() &&
    !options.some((option) => option.value === currentProjectCode)
  ) {
    options.unshift({
      description: "Current Project",
      label: currentProjectCode,
      name: currentProjectName || currentProjectCode,
      selectedDetails: currentProjectCode,
      value: currentProjectCode,
    });
  }

  return options;
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

  return [
    address.addressLine1,
    address.addressLine2,
    address.barangay,
    address.cityMunicipality,
    address.province,
    address.region,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}
