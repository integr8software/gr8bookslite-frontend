"use client";

import { useReceivingReportActionPage } from "@/app/src/hooks/modules/inventory/receiving-report/useReceivingReportActionPage";
import { ReceivingReportAttachments } from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportAttachments";
import { ReceivingReportEntries } from "@/app/src/ui/modules/inventory/receiving-report/entries/ReceivingReportEntries";
import { ReceivingReportHeader } from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportHeader";
import { ReceivingReportNotFound } from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportNotFound";
import { ReceivingReportReportPreview } from "@/app/src/ui/modules/inventory/receiving-report/reports/ReceivingReportReportPreview";
import { ReceivingReportTabs } from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportTabs";
import { ReceivingReportVendorSection } from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportVendorSection";

export function ReceivingReportActionPage() {
  const page = useReceivingReportActionPage();

  if (page.isMissingRecord) {
    return <ReceivingReportNotFound />;
  }

  return (
    <>
      <form className="grid gap-5" onSubmit={page.handleSubmit}>
        <ReceivingReportHeader
          mode={page.mode}
          isReadonly={page.isReadonly}
          copyFromRecords={page.purchaseOrderCopyRecords}
          onCopyFromPurchaseOrder={page.copyFromPurchaseOrders}
          onPreview={page.openReportPreview}
        />
        <ReceivingReportTabs
          activeTab={page.activeTab}
          attachmentCount={page.values.attachments.length}
          onTabChange={page.setActiveTab}
        />
        {page.activeTab === "details" ? (
          <>
            <section className="grid gap-5 rounded-sm border border-darknavy/10 bg-white px-2 py-2 shadow-sm shadow-darknavy/5 sm:px-2.5">
              <ReceivingReportVendorSection
                errors={page.errors}
                isReadonly={page.isReadonly}
                values={page.values}
                onChange={page.handleInputChange}
              />
            </section>
            <ReceivingReportEntries
              accountingEntries={page.values.accountingEntries}
              error={page.errors.lines}
              isReadonly={page.isReadonly}
              rows={page.values.lines}
              totals={page.totals}
              onAccountingRowsChange={page.updateAccountingEntries}
              onUpdateAccountingEntry={page.updateAccountingEntry}
              onRowsChange={page.updateLines}
              onUpdateLine={page.updateLine}
            />
          </>
        ) : (
          <ReceivingReportAttachments
            attachments={page.values.attachments}
            isReadonly={page.isReadonly}
            onAddAttachments={page.handleAttachmentChange}
            onRemoveAttachment={page.removeAttachment}
          />
        )}
      </form>
      <ReceivingReportReportPreview
        isOpen={page.isReportPreviewOpen}
        values={page.values}
        totals={page.totals}
        onClose={page.closeReportPreview}
        onGeneratePdf={page.generatePdf}
      />
    </>
  );
}
