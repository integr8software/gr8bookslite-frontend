"use client";

import { Suspense } from "react";
import { FileText } from "lucide-react";
import { SalesQuotationActionPageCopy } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { useSalesQuotationActionPage } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotationActionPage";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { SalesQuotationEntrySection } from "@/app/src/ui/modules/sales/sales-quotation/entries/SalesQuotationEntrySection";
import { SalesQuotationNotFound } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationNotFound";
import { SalesQuotationReportPreview } from "@/app/src/ui/modules/sales/sales-quotation/reports/SalesQuotationReportPreview";
import { SalesQuotationDetailsFields } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationDetailsFields";
import { SalesQuotationActionHeader } from "@/app/src/ui/modules/sales/sales-quotation/action/SalesQuotationActionHeader";

export function SalesQuotationActionPage() {
  return (
    <Suspense fallback={<SalesQuotationFormSkeleton />}>
      <SalesQuotationActionPageInner />
    </Suspense>
  );
}

function SalesQuotationActionPageInner() {
  const page = useSalesQuotationActionPage();
  const title = getSalesQuotationTitle(page.mode, page.existingRequest?.transNo);

  if (page.needsRecord && !page.existingRequest) {
    return <SalesQuotationNotFound />;
  }

  return (
    <section className="sales-quotation-form-page grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title={title}
        description={SalesQuotationActionPageCopy[page.mode].description}
        eyebrow={
          <>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Sales document
          </>
        }
        actions={<SalesQuotationActionHeader page={page} />}
      />

      <div className="grid min-w-0 gap-5">
        <SalesQuotationDetailsFields isReadonly={page.isReadonly} values={page.values} onUpdateField={page.updateField} />
        <SalesQuotationEntrySection
          error={page.errors.items}
          isReadonly={page.isReadonly}
          rows={page.values.items}
          onRowsChange={page.updateItems}
        />
      </div>

      <SalesQuotationReportPreview isOpen={page.showPreview} onClose={() => page.setShowPreview(false)} record={page.previewRecord} />
    </section>
  );
}

function SalesQuotationFormSkeleton() {
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

function getSalesQuotationTitle(mode: string, transNo?: string) {
  if (mode === "add") {
    return SalesQuotationActionPageCopy.add.title;
  }

  if (mode === "edit") {
    return `${SalesQuotationActionPageCopy.edit.title} ${transNo ?? ""}`;
  }

  return `${SalesQuotationActionPageCopy.view.title} ${transNo ?? ""}`;
}
