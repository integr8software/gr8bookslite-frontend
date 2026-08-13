"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  CashAdvanceHref,
  CashAdvanceStatuses,
} from "@/app/src/constants/modules/cash-disbursement/cash-advance/CashAdvanceConstants";
import { useCashAdvanceActionForm } from "@/app/src/hooks/modules/cash-disbursement/cash-advance/useCashAdvance";
import type { CashAdvanceActionMode } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import { CashAdvanceDetailsForm } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceDetailsFields";
import { CashAdvanceActionHeader } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceActionHeader";
import { CashAdvanceNotFound } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceNotFound";
import { openCashAdvancePdf } from "@/app/src/ui/modules/cash-disbursement/cash-advance/reports/CashAdvancePdf";
import { CashAdvanceReportPreview } from "@/app/src/ui/modules/cash-disbursement/cash-advance/reports/CashAdvanceReportPreview";

export function CashAdvanceActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getActionMode(pathname);
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const advanceForm = useCashAdvanceActionForm(mode, recordId, () => {
    router.push(CashAdvanceHref);
  });

  if (advanceForm.isRecordMissing) {
    return <CashAdvanceNotFound />;
  }

  return (
    <>
      <section className="grid gap-5">
        <CashAdvanceActionHeader
          mode={mode}
          onPreview={() => setIsReportPreviewOpen(true)}
          onSaveDraft={
            mode === "add"
              ? () => advanceForm.submitAdvance(CashAdvanceStatuses.draft)
              : undefined
          }
          onSubmit={() => advanceForm.submitAdvance(CashAdvanceStatuses.forApproval)}
          onUpdateStatus={advanceForm.updateAdvanceStatus}
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

function getActionMode(pathname: string): CashAdvanceActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
