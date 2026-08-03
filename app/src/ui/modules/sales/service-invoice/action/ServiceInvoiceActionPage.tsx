"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ServiceInvoiceHref } from "@/app/src/constants/modules/sales/service-invoice/ServiceInvoiceConstants";
import { useServiceInvoiceActionForm } from "@/app/src/hooks/modules/sales/service-invoice/useServiceInvoice";
import type { ServiceInvoiceActionMode } from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";
import { ServiceInvoiceCustomerFields } from "@/app/src/ui/modules/sales/service-invoice/action/ServiceInvoiceCustomerFields";
import { ServiceInvoiceFormHeader } from "@/app/src/ui/modules/sales/service-invoice/action/ServiceInvoiceFormHeader";
import { ServiceInvoiceEntrySection } from "@/app/src/ui/modules/sales/service-invoice/entries/ServiceInvoiceEntrySection";
import { ServiceInvoiceNotFound } from "@/app/src/ui/modules/sales/service-invoice/overview/ServiceInvoiceNotFound";
import { openServiceInvoicePdf } from "@/app/src/ui/modules/sales/service-invoice/reports/ServiceInvoicePdf";
import { ServiceInvoiceReportPreview } from "@/app/src/ui/modules/sales/service-invoice/reports/ServiceInvoiceReportPreview";

export function ServiceInvoiceActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const invoiceForm = useServiceInvoiceActionForm(mode, recordId, () => {
    router.push(ServiceInvoiceHref);
  });

  if (invoiceForm.isRecordMissing) {
    return <ServiceInvoiceNotFound />;
  }

  return (
    <>
      <section className="grid gap-5">
        <ServiceInvoiceFormHeader
          mode={mode}
          onPreview={() => setIsReportPreviewOpen(true)}
          values={invoiceForm.values}
          onSubmit={invoiceForm.submitInvoice}
        />
        <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
          <ServiceInvoiceCustomerFields
            isReadonly={isReadonly}
            values={invoiceForm.values}
            onUpdateField={invoiceForm.updateField}
          />
        </section>
        <ServiceInvoiceEntrySection
          isReadonly={isReadonly}
          values={invoiceForm.values}
          onAccountingRowsChange={invoiceForm.updateAccountingEntries}
          onRowsChange={invoiceForm.updateLineEntries}
        />
      </section>
      <ServiceInvoiceReportPreview
        isOpen={isReportPreviewOpen}
        values={invoiceForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openServiceInvoicePdf(invoiceForm.values)}
      />
    </>
  );
}

function getModeFromPathname(pathname: string): ServiceInvoiceActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
