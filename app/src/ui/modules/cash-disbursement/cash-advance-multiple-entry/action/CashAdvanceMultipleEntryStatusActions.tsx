import type { CashAdvanceStatus } from "@/app/src/types/modules/cash-disbursement/cash-advance/CashAdvanceTypes";
import type { CashAdvanceMultipleEntryRecord } from "@/app/src/types/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryTypes";
import { createCashAdvanceMultipleEntryApprovalRecord } from "@/app/src/data/modules/cash-disbursement/cash-advance-multiple-entry/CashAdvanceMultipleEntryData";
import { CashAdvanceStatusActions } from "@/app/src/ui/modules/cash-disbursement/cash-advance/action/CashAdvanceStatusActions";

export function CashAdvanceMultipleEntryStatusActions({
  onRequestStatusConfirmation,
  onUpdateStatus,
  record,
}: {
  onRequestStatusConfirmation: (status: CashAdvanceStatus) => void;
  onUpdateStatus?: (status: CashAdvanceStatus) => void;
  record?: CashAdvanceMultipleEntryRecord | null;
}) {
  const approvalRecord = createCashAdvanceMultipleEntryApprovalRecord(record ?? null);

  return (
    <CashAdvanceStatusActions
      record={approvalRecord}
      onRequestStatusConfirmation={onRequestStatusConfirmation}
      onUpdateStatus={onUpdateStatus}
    />
  );
}
