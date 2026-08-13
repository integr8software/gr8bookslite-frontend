"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BillingHref } from "@/app/src/constants/modules/sales/billing/BillingConstants";
import { useBillingActionForm } from "@/app/src/hooks/modules/sales/billing/useBilling";
import type { BillingActionMode } from "@/app/src/types/modules/sales/billing/BillingTypes";
import {
  BillingDetailsForm,
  type BillingDetailsSection,
} from "@/app/src/ui/modules/sales/billing/form/BillingContent";
import { BillingFormHeader } from "@/app/src/ui/modules/sales/billing/form/BillingFormHeader";
import { BillingEntrySection } from "@/app/src/ui/modules/sales/billing/entries/BillingEntrySection";
import { BillingNotFound } from "@/app/src/ui/modules/sales/billing/overview/BillingNotFound";
import { openBillingPdf } from "@/app/src/ui/modules/sales/billing/reports/BillingPdf";
import { BillingReportPreview } from "@/app/src/ui/modules/sales/billing/reports/BillingReportPreview";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function BillingActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeTab, setActiveTab] = useState<BillingDetailsSection>("customer");
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const invoiceForm = useBillingActionForm(mode, recordId, () => {
    router.push(BillingHref);
  });

  if (invoiceForm.isRecordMissing) {
    return <BillingNotFound />;
  }

  return (
    <>
      <section className="grid gap-5">
        <BillingFormHeader
          mode={mode}
          onPreview={() => setIsReportPreviewOpen(true)}
          values={invoiceForm.values}
          onSubmit={invoiceForm.submitInvoice}
        />
        <ModuleTabs activeTab={activeTab} ariaLabel="Billing sections" tabs={BillingTabs} onTabChange={setActiveTab} />
        <BillingDetailsForm
          isReadonly={isReadonly}
          section={activeTab}
          values={invoiceForm.values}
          onUpdateField={invoiceForm.updateField}
        />
        <BillingEntrySection
          isReadonly={isReadonly}
          values={invoiceForm.values}
          onAccountingRowsChange={invoiceForm.updateAccountingEntries}
          onRowsChange={invoiceForm.updateLineEntries}
        />
      </section>
      <BillingReportPreview
        isOpen={isReportPreviewOpen}
        values={invoiceForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openBillingPdf(invoiceForm.values)}
      />
    </>
  );
}

const BillingTabs = [
  { id: "customer", label: "Customer / Billing" },
  { id: "attachment", label: "File Attachment" },
] satisfies ModuleTabItem<BillingDetailsSection>[];

function getModeFromPathname(pathname: string): BillingActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
