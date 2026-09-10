"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PurchaseOrderHref } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import { usePurchaseOrderFormPage } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrderFormPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import type { PartyAddress, PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { PurchaseOrderDetailsForm } from "@/app/src/ui/modules/purchasing/purchase-order/form/PurchaseOrderFieldContent";
import { PurchaseOrderFormHeader } from "@/app/src/ui/modules/purchasing/purchase-order/form/PurchaseOrderPageHeader";
import { PurchaseOrderEntrySection } from "@/app/src/ui/modules/purchasing/purchase-order/entries/PurchaseOrderEntrySection";
import { PurchaseOrderReportPreview } from "@/app/src/ui/modules/purchasing/purchase-order/reports/PurchaseOrderReportPreview";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function PurchaseOrderActionPage() {
  return (
    <Suspense fallback={<PurchaseOrderFormSkeleton />}>
      <PurchaseOrderActionPageInner />
    </Suspense>
  );
}

function PurchaseOrderActionPageInner() {
  const page = usePurchaseOrderFormPage();
  const partyStore = usePartyManagementStore();
  const partyOptions = useMemo(
    () => createPartyOptions(partyStore.records, page.values),
    [page.values, partyStore.records],
  );

  if (page.needsRecord && !page.existingOrder) {
    return <PurchaseOrderNotFound />;
  }

  return (
    <section className="grid gap-5">
      <PurchaseOrderFormHeader
        copyFromRecords={page.copyFromRecords}
        isSubmitting={page.isSubmitting}
        mode={page.mode}
        recordId={page.recordId}
        values={page.values}
        onCopyFromSource={page.copyFromSourceRecords}
        onPreview={() => page.setShowPreview(true)}
        onSubmit={page.handleSubmit}
      />
      <PurchaseOrderDetailsForm
        isReadonly={page.isReadonly}
        partyOptions={partyOptions}
        values={page.values}
        onSelectParty={(partyCode) => {
          const party = partyStore.records.find((record) => record.partyCodeNo === partyCode);

          page.updateField("partyId", party?.id ?? "");
          page.updateField("vceCode", party?.partyCodeNo ?? "");
          page.updateField("vceName", party ? getPartyDisplayName(party) : "");
          page.updateField("address", party ? formatPartyAddress(getPurchaseOrderPartyAddress(party)) : "");
          page.updateField("emailAddress", party?.email ?? "");
          page.updateField("contactNo", party?.contactNo ?? "");
          page.updateField("termId", party?.termId ?? "");
          page.updateField("termsOfPayment", party?.termName ?? "");
          if (party?.purchaseType) {
            page.updateField("purchaseType", party.purchaseType);
          }
        }}
        onUpdateField={page.updateField}
      />
      <PurchaseOrderEntrySection
        accountingRows={page.values.accountingEntries}
        error={page.errors.items}
        itemDescriptionOptions={page.itemDescriptionOptions}
        isReadonly={page.isReadonly}
        purchaseType={page.values.purchaseType}
        copyFromSource={page.values.copyFromSource}
        rows={page.values.items}
        serviceDescriptionOptions={page.serviceDescriptionOptions}
        onAccountingRowsChange={page.updateAccountingEntries}
        onRowsChange={page.updateItems}
      />
      <PurchaseOrderReportPreview isOpen={page.showPreview} record={page.previewRecord} onClose={() => page.setShowPreview(false)} />
    </section>
  );
}

function createPartyOptions(
  records: PartyInformationRecord[],
  values: { vceCode: string; vceName: string },
): AppAdvancedDropdownOption[] {
  const options = records
    .filter(
      (record) =>
        record.status === "Active" &&
        record.partyCodeNo.trim() !== "" &&
        record.partyTypes.some((partyType) => partyType.trim().toUpperCase() === "VENDOR"),
    )
    .map((record) => ({
      description: record.partyTypes.join(", "),
      label: record.partyCodeNo,
      name: getPartyDisplayName(record),
      selectedDetails: record.partyCodeNo,
      value: record.partyCodeNo,
    }));
  const selectedValue = values.vceCode;

  if (selectedValue && !options.some((option) => option.value === selectedValue)) {
    options.unshift({
      description: "Current party",
      label: values.vceCode,
      name: values.vceName || values.vceCode,
      selectedDetails: values.vceCode,
      value: selectedValue,
    });
  }

  return options;
}

function getPurchaseOrderPartyAddress(record: PartyInformationRecord) {
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

function PurchaseOrderNotFound() {
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Purchase Order Not Found"
        description="The selected purchase order could not be found."
        actions={
          <Link href={PurchaseOrderHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to List
          </Link>
        }
      />
    </section>
  );
}

function PurchaseOrderFormSkeleton() {
  return (
    <section className="grid gap-5">
      <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
      <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
    </section>
  );
}
