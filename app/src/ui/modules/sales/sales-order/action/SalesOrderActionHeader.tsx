import Link from "next/link";
import { ArrowLeft, FileText, Printer, Save } from "lucide-react";
import { SalesOrderHref } from "@/app/src/constants/modules/sales/sales-order/SalesOrderConstants";
import { getSalesQuotationTotal } from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type { useSalesOrderActionPage } from "@/app/src/hooks/modules/sales/sales-order/useSalesOrderActionPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type SalesOrderActionHeaderProps = {
  page: ReturnType<typeof useSalesOrderActionPage>;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
};

export function SalesOrderActionHeader({ isPreviewOpen, onTogglePreview, page }: SalesOrderActionHeaderProps) {
  return (
    <ModuleHeader
      variant="panel"
      titleAs="h1"
      title={page.mode === "add" ? "New Sales Order" : `Sales Order ${page.values.transNo}`}
      description="Capture order details or copy an approved sales quotation."
      eyebrow={
        <>
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          Sales document
        </>
      }
      actions={
        <>
          <Link href={SalesOrderHref} className={moduleHeaderActionClassNames.secondary}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            List
          </Link>
          <button type="button" onClick={onTogglePreview} className={moduleHeaderActionClassNames.secondary}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            {isPreviewOpen ? "Hide Preview" : "Preview"}
          </button>
          {!page.isReadonly ? (
            <AppCopyFromDropdown
              selectionMode="single"
              sources={["Sales Quotation"]}
              records={page.quotations.map((quotation) => ({
                id: quotation.id,
                source: "Sales Quotation",
                sourceNo: quotation.transNo,
                documentDate: quotation.prDate,
                partyName: quotation.partyName,
                amount: String(getSalesQuotationTotal(quotation)),
                remarks: quotation.remarks,
              }))}
              onApply={(ids) => {
                const quotation = page.quotations.find((record) => record.id === ids[0]);
                if (quotation) page.copyFromQuotation(quotation);
              }}
            />
          ) : null}
          {page.isReadonly ? (
            <Link href={`${SalesOrderHref}/edit/${page.existingOrder?.id ?? ""}`} className={moduleHeaderActionClassNames.primary}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          ) : (
            <button type="button" onClick={page.save} className={moduleHeaderActionClassNames.primary}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          )}
        </>
      }
    />
  );
}
