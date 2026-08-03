"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GoodsReceiptHref } from "@/app/src/constants/modules/inventory/goods-receipt/GoodsReceiptConstants";
import { GoodsReceiptCopyRecords } from "@/app/src/data/modules/inventory/goods-receipt/GoodsReceiptData";
import { useGoodsReceiptActionForm } from "@/app/src/hooks/modules/inventory/goods-receipt/useGoodsReceipt";
import type { GoodsReceiptActionMode } from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";
import { GoodsReceiptDetailsForm } from "@/app/src/ui/modules/inventory/goods-receipt/action/GoodsReceiptDetailsForm";
import { GoodsReceiptFormHeader } from "@/app/src/ui/modules/inventory/goods-receipt/action/GoodsReceiptFormHeader";
import { GoodsReceiptEntrySection } from "@/app/src/ui/modules/inventory/goods-receipt/entries/GoodsReceiptEntrySection";
import { GoodsReceiptNotFound } from "@/app/src/ui/modules/inventory/goods-receipt/overview/GoodsReceiptNotFound";
import { openGoodsReceiptPdf } from "@/app/src/ui/modules/inventory/goods-receipt/reports/GoodsReceiptPdf";
import { GoodsReceiptReportPreview } from "@/app/src/ui/modules/inventory/goods-receipt/reports/GoodsReceiptReportPreview";
import type { AppCopyFromRecord } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function GoodsReceiptActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const receiptForm = useGoodsReceiptActionForm(mode, recordId, () => {
    router.push(GoodsReceiptHref);
  });
  const copyFromRecords = useMemo<AppCopyFromRecord[]>(
    () =>
      GoodsReceiptCopyRecords.map((record) => ({
        amount: record.amount,
        documentDate: record.documentDate,
        id: record.id,
        partyName: record.partyName,
        remarks: record.remarks,
        source: record.source,
        sourceNo: record.sourceNo,
      })),
    [],
  );

  if (receiptForm.isRecordMissing) {
    return <GoodsReceiptNotFound />;
  }

  return (
    <>
      <section className="grid gap-5">
        <GoodsReceiptFormHeader
          copyFromRecords={copyFromRecords}
          mode={mode}
          onCopyFromSource={receiptForm.copyFromSourceRecords}
          onPreview={() => setIsReportPreviewOpen(true)}
          values={receiptForm.values}
          onSubmit={receiptForm.submitReceipt}
        />
        <GoodsReceiptDetailsForm
          isReadonly={isReadonly}
          values={receiptForm.values}
          onUpdateField={receiptForm.updateField}
        />
        <GoodsReceiptEntrySection
          isReadonly={isReadonly}
          rows={receiptForm.values.lineEntries}
          onRowsChange={receiptForm.updateLineEntries}
        />
      </section>
      <GoodsReceiptReportPreview
        isOpen={isReportPreviewOpen}
        values={receiptForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openGoodsReceiptPdf(receiptForm.values)}
      />
    </>
  );
}

function getModeFromPathname(pathname: string): GoodsReceiptActionMode {
  if (pathname.includes("/view/")) return "view";
  if (pathname.includes("/edit/")) return "edit";
  return "add";
}
