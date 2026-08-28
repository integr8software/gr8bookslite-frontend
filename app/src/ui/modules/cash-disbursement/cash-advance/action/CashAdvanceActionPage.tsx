"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CashAdvanceLink, CashAdvanceStatuses } from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import type { CashAdvanceActionMode } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceDetailsForm } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceDetailsFields";
import { CashAdvanceActionHeader } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionHeader";
import { CashAdvanceNotFound } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceNotFound";
import { openCashAdvancePdf } from "@/app/src/ui/modules/cash-disbursement/cash-advance/reports/CashAdvancePdf";
import { CashAdvanceReportPreview } from "@/app/src/ui/modules/cash-disbursement/cash-advance/reports/CashAdvanceReportPreview";

export function CashAdvanceActionPage({ mode }: { mode: CashAdvanceActionMode }) {
  const params = useParams<{ recordId?: string }>();
  const router = useRouter();
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const advanceForm = useCashAdvanceActionForm(mode, recordId, () => {
    router.push(CashAdvanceLink);
  });

  if (advanceForm.isRecordMissing) {
    return <CashAdvanceNotFound />;
  }

  return (
    <>
      <section className="grid gap-5">
        <CashAdvanceActionHeader
          availabilityWarning={advanceForm.availabilityWarning}
          mode={mode}
          hasDiscardableChanges={advanceForm.hasDiscardableChanges}
          isSubmitting={advanceForm.isSubmitting}
          onBack={advanceForm.saveDraft}
          onDiscard={advanceForm.discardDraft}
          onPreview={() => setIsReportPreviewOpen(true)}
          onSaveDraft={mode === "add" ? () => { void advanceForm.submitAdvance(CashAdvanceStatuses.draft); } : undefined}
          onSubmit={() => { void advanceForm.submitAdvance(CashAdvanceStatuses.forApproval); }}
          onUpdateStatus={advanceForm.updateAdvanceStatus}
          onValidate={advanceForm.validateAdvance}
          record={advanceForm.record}
        />
        <CashAdvanceDetailsForm form={advanceForm} mode={mode} />
      </section>
      <CashAdvanceReportPreview
        isOpen={isReportPreviewOpen}
        values={advanceForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openCashAdvancePdf(advanceForm.values)}
      />
    </>
  );
}
