"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CashSalesInvoiceHref } from "@/app/src/constants/modules/sales/cash-sales-invoice/CashSalesInvoiceConstants";
import { useCashSalesInvoiceActionForm } from "@/app/src/hooks/modules/sales/cash-sales-invoice/useCashSalesInvoice";
import type {
  CashSalesInvoiceActionMode,
  CashSalesInvoiceEntryTab,
} from "@/app/src/types/modules/sales/cash-sales-invoice/CashSalesInvoiceTypes";
import { CashSalesInvoiceAccountingEntrySection } from "@/app/src/ui/modules/sales/cash-sales-invoice/entries/CashSalesInvoiceAccountingEntrySection";
import { CashSalesInvoiceEntrySection } from "@/app/src/ui/modules/sales/cash-sales-invoice/entries/CashSalesInvoiceEntrySection";
import { CashSalesInvoiceDetailsForm } from "@/app/src/ui/modules/sales/cash-sales-invoice/form/CashSalesInvoiceDetailsForm";
import { CashSalesInvoiceFormHeader } from "@/app/src/ui/modules/sales/cash-sales-invoice/form/CashSalesInvoiceFormHeader";
import { CashSalesInvoiceNotFound } from "@/app/src/ui/modules/sales/cash-sales-invoice/overview/CashSalesInvoiceNotFound";

export function CashSalesInvoiceActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeTab, setActiveTab] = useState<CashSalesInvoiceEntryTab>("details");
  const invoiceForm = useCashSalesInvoiceActionForm(mode, recordId, () => {
    router.push(CashSalesInvoiceHref);
  });

  if (invoiceForm.isRecordMissing) {
    return <CashSalesInvoiceNotFound />;
  }

  return (
    <section className="grid gap-5">
      <CashSalesInvoiceFormHeader
        mode={mode}
        values={invoiceForm.values}
        onSubmit={invoiceForm.submitInvoice}
      />
      <CashSalesInvoiceDetailsForm
        isReadonly={isReadonly}
        values={invoiceForm.values}
        onUpdateField={invoiceForm.updateField}
      />
      {activeTab === "accounting" ? (
        <CashSalesInvoiceAccountingEntrySection
          activeTab={activeTab}
          isReadonly={isReadonly}
          rows={invoiceForm.values.accountingEntries}
          onRowsChange={invoiceForm.updateAccountingEntries}
          onTabChange={setActiveTab}
        />
      ) : (
        <CashSalesInvoiceEntrySection
          activeTab={activeTab}
          isReadonly={isReadonly}
          values={invoiceForm.values}
          onRowsChange={invoiceForm.updateLineEntries}
          onTabChange={setActiveTab}
        />
      )}
    </section>
  );
}

function getModeFromPathname(pathname: string): CashSalesInvoiceActionMode {
  if (pathname.includes("/view/")) return "view";
  if (pathname.includes("/edit/")) return "edit";
  return "add";
}
