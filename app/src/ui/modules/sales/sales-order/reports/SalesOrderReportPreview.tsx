"use client";

import type { SalesOrderRecord } from "@/app/src/types/modules/sales/sales-order/SalesOrderTypes";
import { SalesQuotationPrintPreview } from "@/app/src/ui/modules/sales/sales-quotation/reports/SalesQuotationPrintPreview";
import { openSalesQuotationPdf } from "@/app/src/ui/modules/sales/sales-quotation/reports/SalesQuotationPdf";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type SalesOrderReportPreviewProps = {
  isOpen: boolean;
  onClose: () => void;
  record: SalesOrderRecord;
};

export function SalesOrderReportPreview({ isOpen, onClose, record }: SalesOrderReportPreviewProps) {
  return (
    <ReportPreviewDrawer
      className="sales-order-preview-drawer"
      isOpen={isOpen}
      eyebrow="Sales document"
      title="Print Preview"
      description="Review the printable sales order layout."
      onClose={onClose}
      onGeneratePdf={() => openSalesQuotationPdf(record)}
    >
      <SalesQuotationPrintPreview record={record} showControls={false} />
    </ReportPreviewDrawer>
  );
}
