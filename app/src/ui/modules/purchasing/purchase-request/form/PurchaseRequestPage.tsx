"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PurchaseRequestHref } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import { usePurchaseRequestFormPage } from "@/app/src/hooks/modules/purchasing/purchase-request/usePurchaseRequestFormPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
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

  if (page.needsRecord && !page.existingRequest) {
    return <PurchaseRequestNotFound />;
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
        <PurchaseRequestDetailsForm isReadonly={page.isReadonly} values={page.values} onUpdateField={page.updateField} />
        <PurchaseRequestEntrySection
          accountingRows={page.values.accountingEntries}
          error={page.errors.items}
          isReadonly={page.isReadonly}
          rows={page.values.items}
          onAccountingRowsChange={page.updateAccountingEntries}
          onRowsChange={page.updateItems}
        />
      </div>

      <PurchaseRequestPreviewDrawer isOpen={page.showPreview} record={page.previewRecord} onClose={() => page.setShowPreview(false)} />
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
