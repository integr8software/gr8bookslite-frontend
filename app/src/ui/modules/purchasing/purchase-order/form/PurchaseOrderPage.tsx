"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PurchaseOrderHref } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import { usePurchaseOrderFormPage } from "@/app/src/hooks/modules/purchasing/purchase-order/usePurchaseOrderFormPage";
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
      <PurchaseOrderDetailsForm isReadonly={page.isReadonly} values={page.values} onUpdateField={page.updateField} />
      <PurchaseOrderEntrySection
        accountingRows={page.values.accountingEntries}
        error={page.errors.items}
        isReadonly={page.isReadonly}
        rows={page.values.items}
        values={page.values}
        onAccountingRowsChange={page.updateAccountingEntries}
        onRowsChange={page.updateItems}
        onUpdateField={page.updateField}
      />
      <PurchaseOrderReportPreview isOpen={page.showPreview} record={page.previewRecord} onClose={() => page.setShowPreview(false)} />
    </section>
  );
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
