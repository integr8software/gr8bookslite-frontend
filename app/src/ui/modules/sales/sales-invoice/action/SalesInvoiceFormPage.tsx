"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SalesInvoiceHref } from "@/app/src/constants/modules/sales/sales-invoice/SalesInvoiceConstants";
import {
  getInitialDeliveryReceipts,
  isDeliveryReceiptActiveStatus,
} from "@/app/src/data/modules/inventory/delivery-receipt/DeliveryReceiptData";
import { useSalesInvoiceActionForm } from "@/app/src/hooks/modules/sales/sales-invoice/useSalesInvoice";
import type {
  SalesInvoiceAccountEntry,
  SalesInvoiceActionMode,
  SalesInvoiceLineItem,
} from "@/app/src/types/modules/sales/sales-invoice/SalesInvoiceTypes";
import { SalesInvoiceEntries } from "@/app/src/ui/modules/sales/sales-invoice/entries/SalesInvoiceEntries";
import { SalesInvoiceReportPreview } from "@/app/src/ui/modules/sales/sales-invoice/reports/SalesInvoiceReportPreview";
import { SalesInvoiceActionHeader } from "@/app/src/ui/modules/sales/sales-invoice/action/SalesInvoiceActionHeader";
import { SalesInvoiceDetailsForm } from "@/app/src/ui/modules/sales/sales-invoice/action/SalesInvoiceDetailsForm";
import type { AppCopyFromRecord } from "@/app/src/types/shared/transaction-setup/AppCopyFromTypes";

export function SalesInvoiceFormPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const invoiceForm = useSalesInvoiceActionForm(mode, recordId, () => {
    router.push(SalesInvoiceHref);
  });
  const deliveryReceiptCopyRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      getInitialDeliveryReceipts()
        .filter((receipt) => isDeliveryReceiptActiveStatus(receipt.status))
        .map((receipt) => ({
          documentDate: receipt.documentDate,
          id: receipt.id,
          partyName: receipt.customerName,
          remarks: [receipt.referenceNo, `Qty: ${receipt.totalQuantity.toFixed(2)}`]
            .filter(Boolean)
            .join(" | "),
          source: "Delivery Receipt",
          sourceNo: receipt.transactionNo,
        })),
    [],
  );

  function updateLineItems(lineItems: SalesInvoiceLineItem[]) {
    invoiceForm.updateField("lineItems", lineItems);
  }

  function updateAccountEntries(accountEntries: SalesInvoiceAccountEntry[]) {
    invoiceForm.updateField("accountEntries", accountEntries);
  }

  return (
    <>
      <section className="grid gap-5">
        <SalesInvoiceActionHeader
          copyFromRecords={deliveryReceiptCopyRecords}
          mode={mode}
          onCopyFromDeliveryReceipt={invoiceForm.copyFromDeliveryReceipts}
          onPreview={() => setIsReportPreviewOpen(true)}
          values={invoiceForm.values}
          onSubmit={invoiceForm.submitInvoice}
        />
        <SalesInvoiceDetailsForm
          isReadonly={isReadonly}
          values={invoiceForm.values}
          onUpdateField={invoiceForm.updateField}
        />
        <SalesInvoiceEntries
          accountRows={invoiceForm.values.accountEntries}
          isReadonly={isReadonly}
          rows={invoiceForm.values.lineItems}
          onAccountRowsChange={updateAccountEntries}
          onRowsChange={updateLineItems}
        />
      </section>
      <SalesInvoiceReportPreview
        isOpen={isReportPreviewOpen}
        values={invoiceForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onPrint={() => window.print()}
      />
    </>
  );
}

function getModeFromPathname(pathname: string): SalesInvoiceActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
