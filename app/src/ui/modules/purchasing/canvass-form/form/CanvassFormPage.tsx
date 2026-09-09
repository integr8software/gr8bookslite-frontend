"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CanvassFormHref } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import { useCanvassFormActionPage } from "@/app/src/hooks/modules/purchasing/canvass-form/useCanvassFormActionPage";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { CanvassFormDetailsForm } from "@/app/src/ui/modules/purchasing/canvass-form/form/CanvassFormFieldContent";
import { CanvassFormEntrySection } from "@/app/src/ui/modules/purchasing/canvass-form/entries/CanvassFormEntrySection";
import { CanvassFormFormHeader } from "@/app/src/ui/modules/purchasing/canvass-form/form/CanvassFormPageHeader";
import { CanvassFormReportPreview } from "@/app/src/ui/modules/purchasing/canvass-form/reports/CanvassFormReportPreview";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function CanvassFormActionPage() {
  return (
    <Suspense fallback={<CanvassFormSkeleton />}>
      <CanvassFormActionPageInner />
    </Suspense>
  );
}

function CanvassFormActionPageInner() {
  const page = useCanvassFormActionPage();
  const partyStore = usePartyManagementStore();
  const supplierOptions = useMemo(
    () =>
      partyStore.records
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
        })),
    [partyStore.records],
  );

  if (page.needsRecord && !page.existingForm) {
    return <CanvassFormNotFound />;
  }

  return (
    <section className="grid gap-5">
      <CanvassFormFormHeader
        copyFromRecords={page.copyFromRecords}
        isSubmitting={page.isSubmitting}
        mode={page.mode}
        recordId={page.recordId}
        values={page.values}
        onCopyFromSource={page.copyFromSourceRecords}
        onPreview={() => page.setShowPreview(true)}
        onSubmit={page.handleSubmit}
      />
      <CanvassFormDetailsForm isReadonly={page.isReadonly} values={page.values} onUpdateField={page.updateField} />
      <CanvassFormEntrySection
        accountingRows={page.values.accountingEntries}
        error={page.errors.items}
        itemDescriptionOptions={page.itemDescriptionOptions}
        isReadonly={page.isReadonly}
        purchaseType={page.values.purchaseType}
        rows={page.values.items}
        serviceDescriptionOptions={page.serviceDescriptionOptions}
        supplierOptions={supplierOptions}
        onAccountingRowsChange={page.updateAccountingEntries}
        onRowsChange={page.updateItems}
      />
      <CanvassFormReportPreview isOpen={page.showPreview} record={page.previewRecord} onClose={() => page.setShowPreview(false)} />
    </section>
  );
}

function CanvassFormNotFound() {
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Canvass Order Not Found"
        description="The selected canvass order could not be found."
        actions={
          <Link href={CanvassFormHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to List
          </Link>
        }
      />
    </section>
  );
}

function CanvassFormSkeleton() {
  return (
    <section className="grid gap-5">
      <div className="h-36 animate-pulse rounded-xl bg-white shadow-sm" />
      <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
    </section>
  );
}
